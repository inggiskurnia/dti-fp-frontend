import { ProductCategory, ProductForm } from "@/types/models/products";
import axios from "axios";
import { ApiResponse } from "@/types/api/apiResponse";
import { toast } from "@/hooks/use-toast";
import { getSession } from "next-auth/react";

const productUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCTS}`;
const productCategoryUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCTS}${process.env.NEXT_PUBLIC_PRODUCT_CATEGORY}`;

export const updateProductById = async (
  productId: number,
  values: ProductForm,
): Promise<ApiResponse<ProductForm>> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.put<ApiResponse<ProductForm>>(
    `${productUrl}/${productId}`,
    values,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};

interface UpdateProductCategoryRequest extends ProductCategory {
  accessToken: string;
}

export const updateProductCategoryById = async ({
  id,
  name,
  accessToken,
}: UpdateProductCategoryRequest): Promise<ApiResponse<ProductCategory>> => {
  const response = await axios.put<ApiResponse<ProductCategory>>(
    `${productCategoryUrl}/${id}`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  toast({
    title: "Update Category",
    description: "Successfully updated product category",
    duration: 2000,
  });
  return response.data;
};
