import { toast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/api/apiResponse";
import { ProductMutationProcessRequest } from "@/types/models/productMutation";
import axios from "axios";
import { getSession } from "next-auth/react";

const warehouseInventoryUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_WAREHOUSE_INVENTORIES}`;

interface DeleteWarehouseInventoryRequest
  extends ProductMutationProcessRequest {
  warehouseInventoryId: number;
}

export const deleteWarehouseInventoryById = async ({
  userId,
  notes,
  warehouseInventoryId,
}: DeleteWarehouseInventoryRequest): Promise<ApiResponse<void>> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  try {
    const response = await axios.delete<ApiResponse<void>>(
      `${warehouseInventoryUrl}/${warehouseInventoryId}`,
      {
        data: {
          userId,
          notes,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    toast({
      title: "Success",
      description: "Successfully deleted warehouse inventory",
      duration: 2000,
    });

    return response.data;
  } catch {
    throw new Error("Error deleting warehouse inventory");
  }
};
