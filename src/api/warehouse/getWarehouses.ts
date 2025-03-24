import axios from "axios";
import { ApiResponse } from "@/types/api/apiResponse";
import {
  NearbyWarehouseQuantityResponse,
  WarehouseDetail,
} from "@/types/models/warehouses";
import { getSession } from "next-auth/react";

const warehouseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_WAREHOUSES}`;

export const getAllWarehouses = async (): Promise<
  ApiResponse<WarehouseDetail[]>
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.get<ApiResponse<WarehouseDetail[]>>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/warehouses/all`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};

export const getNearbyWarehouseByProduct = async (
  warehouseId: number,
  productId: number,
): Promise<ApiResponse<NearbyWarehouseQuantityResponse[]>> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  try {
    const response = await axios.get<
      ApiResponse<NearbyWarehouseQuantityResponse[]>
    >(`${warehouseUrl}/available/all`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        productId,
        warehouseId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby warehouses by product:", error);
    throw error;
  }
};
