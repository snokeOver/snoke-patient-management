import config from "../../config";
import AppError from "../../middleWares/errorHandler/appError";
import { prisma } from "../../utils/prisma";
import { ILoginCred } from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status";

import { JwtPayload, Secret, TokenExpiredError } from "jsonwebtoken";
import { UserStatus } from "../../../../generated/prisma";
import { IClientInfo, IJwtPayload } from "../../types";
import { createOtpToken, createToken, verifyToken } from "../../utils/jwtToken";
import { generateOtp } from "../../utils/generateOtp";
import { emailSender } from "../../utils/emailSender";

//Login user with email and password
const loginUser = async (payload: ILoginCred, clientInfo: IClientInfo) => {
  const {
    os,
    browser,
    name,
    ip,
    userAgent,
    location,
    isActive,
    isPreferred,
    isInfected,
  } = clientInfo.device;
  const foundUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!foundUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (!(await bcrypt.compare(payload.password, foundUser.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedSecurityDetails = await tx.securityDetails.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        lastLoginTime: new Date(),
        failedLoginAttemptNumber: 0,
        otpToken: null,
        suspendUntil: null,
        resetAttemptNumber: 0,
      },
    });

    // Check if the user has already logged in from the same device
    const existingDevice = await tx.device.findFirst({
      where: {
        securityDetailsId: updatedSecurityDetails.id,
        userAgent: clientInfo.device.userAgent,
        // ip: clientInfo.device.ip, // You can use IP if relevant for device identification
      },
    });

    if (existingDevice) {
      // If the device exists, update specific fields (like lastLoginTime or isActive)
      await tx.device.update({
        where: {
          id: existingDevice.id,
        },
        data: {
          browser,
          name,
          os,
          ip,
          location,
          isActive,
          isPreferred, // or based on your logic
          isInfected,
        },
      });
    } else {
      await tx.device.create({
        data: {
          securityDetailsId: updatedSecurityDetails.id, // Link the device to the security details
          ...clientInfo.device, // Spread the device data from the request
        },
      });
    }

    return { updatedSecurityDetails };
  });

  const jwtPayload: IJwtPayload = {
    userId: foundUser.id as string,
    email: foundUser.email as string,
    status: foundUser.status,
    role: foundUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    result,
  };
};

//Get access token
const getAccessToken = async (token: string) => {
  let decodedData: JwtPayload | null = null;
  try {
    decodedData = verifyToken(token, config.jwt.jwt_refresh_secret as Secret);
  } catch (err) {
    throw new AppError(httpStatus.FORBIDDEN, "Invalid Refresh Token");
  }

  const foundUser = await prisma.user.findUnique({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!foundUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const jwtPayload: IJwtPayload = {
    userId: foundUser.id as string,
    email: foundUser.email as string,
    status: foundUser.status,
    role: foundUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

//Change password
const changePassword = async (
  userData: JwtPayload | undefined,
  payload: { oldPassword: string; newPassword: string }
) => {
  const allowedAttempt = Number(config.allowed.failed_attempts);
  const suspendTIme = Number(config.allowed.suspend_time_failed_attempt);

  //destructure data
  const { oldPassword, newPassword } = payload;

  if (!userData)
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");

  const { userId } = userData;

  //check if user exist and password is correct
  const foundUser = await prisma.user.findUnique({
    where: {
      id: userId,
      status: UserStatus.ACTIVE,
    },
    include: {
      securityDetails: true,
    },
  });

  if (!foundUser || !foundUser.securityDetails)
    throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const {
    otpToken,
    suspendUntil,
    lastResetAttemptTime,
    failedLoginAttemptNumber,
  } = foundUser.securityDetails;

  // Check if the user is suspended due to multiple failed attempts for less than 60 minutes
  if (suspendUntil && new Date(suspendUntil) > new Date()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account is suspended due to multiple failed attempts. Please try again later."
    );
  }

  // Increase failed attempt count
  let newNoOfAttempt = failedLoginAttemptNumber
    ? failedLoginAttemptNumber + 1
    : 1;

  // Check if the user is suspended due to multiple failed attempts for more than 60 minutes then reset the attempt count to 1
  if (suspendUntil && new Date(suspendUntil) < new Date()) {
    newNoOfAttempt = 1;
    await prisma.securityDetails.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        failedLoginAttemptNumber: newNoOfAttempt,
        suspendUntil: null,
      },
    });
  }

  // If the number of failed attempts exceeds 5, suspend account for 30 minutes
  if (newNoOfAttempt >= allowedAttempt) {
    await prisma.securityDetails.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        failedLoginAttemptNumber: newNoOfAttempt,
        suspendUntil: new Date(Date.now() + suspendTIme * 60 * 1000), // suspend for 60 minutes
      },
    });
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You have reached the maximum number of failed attempts. Please try again later."
    );
  }

  if (!(await bcrypt.compare(oldPassword, foundUser.password))) {
    await prisma.securityDetails.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        failedLoginAttemptNumber: newNoOfAttempt,
      },
    });
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      `Old password is incorrect!, You have ${
        allowedAttempt - newNoOfAttempt
      } attempts left`
    );
  }

  //hash new password and update
  const hashedNewPassword: string = await bcrypt.hash(
    newPassword,
    Number(config.jwt.bcrypt_salt_rounds)
  );

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedNewPassword,
        needPasswordChange: false,
      },
    });

    const updatedSecurityDetails = await tx.securityDetails.update({
      where: {
        userId: userId,
      },
      data: {
        otpToken: null,
        suspendUntil: null,
        lastResetAttemptTime: new Date(),
        failedLoginAttemptNumber: 0,
      },
    });

    return { updatedUser, updatedSecurityDetails };
  });

  return { message: "Password changed successfully" };
};

//Forget password
const forgetPassword = async (payload: { email: string }) => {
  const allowedAttempt = Number(config.allowed.reset_attempts);
  const suspendTIme = Number(config.allowed.suspend_time_failed_reset_attempt);

  // Check if user exists and password is correct
  const foundUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
    include: {
      securityDetails: true,
    },
  });

  if (!foundUser || !foundUser.securityDetails) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const { suspendUntil, lastResetAttemptTime, resetAttemptNumber } =
    foundUser.securityDetails;

  // Check if the user is blocked due to multiple failed attempts
  if (suspendUntil && new Date(suspendUntil) > new Date()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account is suspended due to multiple failed attempts. Please try again later."
    );
  }

  // Check if the user can request a new OTP (only after 60 seconds from the last request)
  if (
    lastResetAttemptTime &&
    new Date(lastResetAttemptTime).getTime() > Date.now() - 60000
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only request a new OTP after 60 seconds."
    );
  }

  // Generate OTP and OTP token
  const otp = generateOtp();

  const createdOtpToken = createOtpToken(
    {
      otp,
      email: foundUser.email as string,
    },

    config.jwt.jwt_otp_secret as Secret,
    config.jwt.jwt_otp_expire_in as string
  );

  // Increase attempt count
  let newNoOfAttempt = resetAttemptNumber ? resetAttemptNumber + 1 : 1;

  // Check if the user is blocked due to multiple failed attempts for more than 60 minutes then reset the attempt count to 1
  if (suspendUntil && new Date(suspendUntil) < new Date()) {
    newNoOfAttempt = 1;
  }

  // If the number of attempts exceeds allowedAttempt, block the user for 30 minutes
  if (newNoOfAttempt >= allowedAttempt) {
    await prisma.securityDetails.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        otpToken: createdOtpToken,
        resetAttemptNumber: newNoOfAttempt,
        suspendUntil: new Date(Date.now() + suspendTIme * 60 * 1000), // Block for 30 minutes
      },
    });
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You have reached the maximum number of OTP attempts. Please try again later."
    );
  }

  // Now send the OTP email if the attempts are below the limit
  const emailContent = await emailSender.createEmailContent(
    { otpCode: otp, userName: foundUser.id },
    "forgotPassword"
  );

  await emailSender.sendEmail(
    foundUser.email,
    emailContent,
    "Reset Password OTP"
  );

  // Update user with otpToken, attempt count, last OTP request time
  const updatedUser = await prisma.securityDetails.update({
    where: {
      userId: foundUser.id,
    },
    data: {
      otpToken: createdOtpToken,
      resetAttemptNumber: newNoOfAttempt,
      lastResetAttemptTime: new Date(), // Set the time when OTP was requested
      suspendUntil: null,
    },
  });

  const remainAttemptNumber = allowedAttempt - newNoOfAttempt;
  return {
    message: `OTP has been sent to ${foundUser.email}`,
    attemptLeft: `You have ${remainAttemptNumber} ${
      remainAttemptNumber > 1 ? "attempts" : "attempt"
    } left`,
  };
};

//verify OTP
const verifyOTP = async (payload: { email: string; otp: string }) => {
  const allowedAttempt = Number(config.allowed.failed_attempts);
  const suspendTIme = Number(config.allowed.suspend_time_failed_attempt);

  if (!payload)
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");

  //destructure data
  const { email, otp } = payload;

  //check if user exist and password is correct
  const foundUser = await prisma.user.findUnique({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
    include: {
      securityDetails: true,
    },
  });

  if (!foundUser || !foundUser.securityDetails)
    throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const {
    otpToken,
    suspendUntil,
    lastResetAttemptTime,
    failedLoginAttemptNumber,
  } = foundUser.securityDetails;

  // Check if the user is suspended due to multiple failed attempts for less than 60 minutes
  if (suspendUntil && new Date(suspendUntil) > new Date()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account is suspended due to multiple failed attempts. Please try again later."
    );
  }

  // console.log(foundUser.securityDetails);

  // Increase failed attempt count
  let newNoOfAttempt = failedLoginAttemptNumber
    ? failedLoginAttemptNumber + 1
    : 1;

  // Check if the user is suspended due to multiple failed attempts for more than 60 minutes then reset the attempt count to 1
  if (suspendUntil && new Date(suspendUntil) < new Date()) {
    newNoOfAttempt = 1;
    await prisma.securityDetails.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        failedLoginAttemptNumber: newNoOfAttempt,
        suspendUntil: null,
      },
    });
  }

  // If the number of failed attempts exceeds 5, suspend account for 30 minutes
  if (newNoOfAttempt >= allowedAttempt) {
    await prisma.securityDetails.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        failedLoginAttemptNumber: newNoOfAttempt,
        suspendUntil: new Date(Date.now() + suspendTIme * 60 * 1000), // suspend for 60 minutes
      },
    });
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You have reached the maximum number of failed attempts. Please try again later."
    );
  }

  let decodedOtp = null;

  if (otpToken) {
    try {
      const decodedToken = verifyToken(
        otpToken,
        config.jwt.jwt_otp_secret as Secret
      );
      decodedOtp = decodedToken.otp;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // Handle token expiry
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "OTP expired! Please try again"
        );
      } else {
        // Invalid token error
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token!");
      }
    }
  }

  if (!decodedOtp || decodedOtp !== otp) {
    await prisma.securityDetails.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        failedLoginAttemptNumber: newNoOfAttempt,
      },
    });
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      `OTP is incorrect!, You have ${
        allowedAttempt - newNoOfAttempt
      } attempts left`
    );
  }

  const createdResetToken = createOtpToken(
    {
      otp,
      email: foundUser.email as string,
    },

    config.jwt.jwt_pass_reset_secret as Secret,
    config.jwt.jwt_pass_reset_expires_in as string
  );

  await prisma.securityDetails.update({
    where: {
      userId: foundUser.id,
    },
    data: {
      otpToken: createdResetToken,
    },
  });

  return { resetToken: createdResetToken };
};

//Reset password
const resetPassword = async (
  token: string | undefined,
  payload: { password: string }
) => {
  if (!token)
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");

  let email = "";

  try {
    const decoded = verifyToken(
      token,
      config.jwt.jwt_pass_reset_secret as string
    );

    email = decoded.email;
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Session timeout! Please try again"
      );
    }
    throw new AppError(httpStatus.UNAUTHORIZED, error.message);
  }

  //check if user exist
  const foundUser = await prisma.user.findUnique({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
    include: {
      securityDetails: true,
    },
  });

  if (!foundUser || !foundUser.securityDetails)
    throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (
    !foundUser.securityDetails.otpToken ||
    token !== foundUser.securityDetails.otpToken
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Session terminated! Please try again"
    );
  }

  if (await bcrypt.compare(payload.password, foundUser.password)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `New password can't be the same as Old password!,`
    );
  }

  const hashedNewPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.jwt.bcrypt_salt_rounds)
  );

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: {
        email,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    const updatedSecurityDetails = await tx.securityDetails.update({
      where: {
        userId: updatedUser.id,
      },
      data: {
        failedLoginAttemptNumber: 0,
        suspendUntil: null,
        otpToken: null,
        resetAttemptNumber: 0,
      },
    });

    return { updatedUser, updatedSecurityDetails };
  });

  return { message: "Password reset successfully" };
};

export const authService = {
  loginUser,
  getAccessToken,
  changePassword,
  forgetPassword,
  verifyOTP,
  resetPassword,
};
