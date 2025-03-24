import { ApiResponse } from "@/types/api/apiResponse";
import { ProductMutationRequest } from "@/types/models/productMutation";
import { WarehouseInventory } from "@/types/models/warehouseInventories";
import axios from "axios";
import { getSession } from "next-auth/react";

const warehouseInventoryUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_WAREHOUSE_INVENTORIES}`;

export const updateQuantityWarehouseInventoryById = async (
  productId: number,
  body: ProductMutationRequest,
): Promise<ApiResponse<WarehouseInventory>> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.put<ApiResponse<WarehouseInventory>>(
    `${warehouseInventoryUrl}/quantity/${productId}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};
