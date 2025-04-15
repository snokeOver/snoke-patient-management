import { IPagination, IPaginationReturn } from "../types";

export const paginationHelper = (options: IPagination): IPaginationReturn => {
  const page: number = Number(options.page) || 1;
  const take: number = Number(options.limit) || 10;
  const skip = (page - 1) * take;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  const orderBy = {
    [sortBy]: sortOrder,
  };
  return {
    page,
    take,
    skip,
    orderBy,
  };
};
