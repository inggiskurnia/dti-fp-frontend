import axios from "axios";
import { ApiResponse } from "@/types/api/apiResponse";
import { toast } from "@/hooks/use-toast";

const productUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCTS}`;
const productCategoryUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCTS}${process.env.NEXT_PUBLIC_PRODUCT_CATEGORY}`;

export interface DeleteItemRequest {
  id: number;
  accessToken: string;
}

export const deleteProductById = async ({
  id,
  accessToken,
}: DeleteItemRequest): Promise<ApiResponse<void>> => {
  const response = await axios.delete<ApiResponse<void>>(
    `${productUrl}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data;
};

export const deleteProductCategoryById = async ({
  id,
  accessToken,
}: DeleteItemRequest): Promise<ApiResponse<void>> => {
  const response = await axios.delete<ApiResponse<void>>(
    `${productCategoryUrl}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.data.success) {
    toast({
      title: "Error deleting product category",
      description: response.data.message,
      variant: "destructive",
      duration: 3000,
    });
  }
  return response.data;
};
