import { toast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/api/apiResponse";
import { ProductMutationRequest } from "@/types/models/productMutation";
import axios from "axios";
import { getSession } from "next-auth/react";

const warehouseInventoryUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_WAREHOUSE_INVENTORIES}`;

export const createWarehouseInventory = async ({
  productId,
  quantity,
  requesterId,
  requesterNotes,
  destinationWarehouseId,
}: ProductMutationRequest): Promise<ApiResponse<ProductMutationRequest>> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  try {
    const response = await axios.post<ApiResponse<ProductMutationRequest>>(
      warehouseInventoryUrl,
      {
        productId,
        quantity,
        requesterId,
        requesterNotes,
        destinationWarehouseId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    toast({
      title: "Create Inventory",
      description: "Create new inventory success!",
      duration: 2000,
    });
    return response.data;
  } catch {
    toast({
      title: "Error",
      description: "Failed to create new inventory.",
      duration: 2000,
    });
    throw new Error("Error creating warehouse inventory");
  }
};
