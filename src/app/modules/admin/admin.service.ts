import { Admin, Prisma, User, UserStatus } from "../../../../generated/prisma";
import { IMeta } from "../../../types";
import { paginationHelper } from "../../../utils/paginationHealper";
import { prisma } from "../../../utils/prisma";
import { adminSearchableFields } from "./admin.constant";
import { IAllAdmin, IDeletedAdmin } from "./admin.interface";

//Update single admin data by id
const deleteSingleAdmin = async (id: string): Promise<IDeletedAdmin> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    const deletedAdmin = await tx.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    const deletedUser = await tx.user.update({
      where: {
        email: deletedAdmin.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return { deletedAdmin, deletedUser };
  });

  return result;
};

//Update single admin data by id
const updateSingleAdmin = async (
  id: string,
  data: Partial<Admin>
): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id,
    },
    data,
  });
  return result;
};

//Get single admin data by id
const getSingleAdmin = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.admin.findUnique({
    where: {
      id,
    },
  });
  return result;
};

//Get all admin data
const getAllAdmin = async (query: any, pagination: any): Promise<IAllAdmin> => {
  const { page, take, skip, orderBy } = paginationHelper(pagination);

  // console.log("Pagination data:", pagination);
  const { searchTerm, ...filterData } = query;
  const searchCondition: Prisma.AdminWhereInput[] = [];

  if (query.searchTerm) {
    searchCondition.push({
      OR: adminSearchableFields.map((field) => ({
        [field]: { contains: query.searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    searchCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  //Do not show data where isDeleted is true
  searchCondition.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.AdminWhereInput = { AND: searchCondition };

  const result = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take,
    orderBy,
  });

  const total = await prisma.admin.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit: take,
      total,
    },
    data: result,
  };
};

export const adminService = {
  getSingleAdmin,
  getAllAdmin,
  updateSingleAdmin,
  deleteSingleAdmin,
};
