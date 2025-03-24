import { ApiResponse } from "@/types/api/apiResponse";
import { PaginationResponse } from "@/types/api/pagination";
import {
  WarehouseInventoryPagination,
  WarehouseInventoryParams,
} from "@/types/models/warehouseInventories";
import axios from "axios";
import { getSession } from "next-auth/react";

const warehouseInventoryUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_WAREHOUSE_INVENTORIES}`;

export const getPaginatedWarehouseInventories = async ({
  page,
  limit,
  warehouseId,
  productCategoryId,
  searchQuery,
}: WarehouseInventoryParams): Promise<
  PaginationResponse<WarehouseInventoryPagination>
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.get<
    ApiResponse<PaginationResponse<WarehouseInventoryPagination>>
  >(warehouseInventoryUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: { page, limit, warehouseId, productCategoryId, searchQuery },
  });

  if (!response.data || !response.data) {
    throw new Error("Invalid API response structure.");
  }
  return response.data.data;
};
