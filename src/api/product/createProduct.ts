import axios from "axios";
import { ApiResponse } from "@/types/api/apiResponse";
import { ProductCategory, ProductForm } from "@/types/models/products";
import { getSession } from "next-auth/react";

const productUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCTS}`;
const productCategoryUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCTS}${process.env.NEXT_PUBLIC_PRODUCT_CATEGORY}`;

export const createProduct = async (
  form: ProductForm,
): Promise<ApiResponse<ProductForm>> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.post<ApiResponse<ProductForm>>(
    productUrl,
    form,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};

interface CreateProductCategoryRequest {
  name: string;
  accessToken: string;
}

export const createProductCategory = async ({
  name,
  accessToken,
}: CreateProductCategoryRequest): Promise<ApiResponse<ProductCategory>> => {
  const response = await axios.post<ApiResponse<ProductCategory>>(
    productCategoryUrl,
    { name },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};
