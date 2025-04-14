import { ISendResponse } from "../types";

export const sendResponse = <T>({ res, sendData }: ISendResponse<T>): void => {
  const { statusCode, success, message, data, meta, error } = sendData;

  const responsePayload: Record<string, unknown> = {
    success,
    message,
    ...(data !== undefined && { data: data || null }),
    ...(error !== undefined && { error: error || null }),
    ...(meta !== undefined && { meta: meta || null }),
  };

  res.status(statusCode).json(responsePayload);
};
