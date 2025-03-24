import { ApiResponse } from "@/types/api/apiResponse";
import {
  ProductMutationRequest,
  ProductMutationManualResponse,
} from "@/types/models/productMutation";
import axios from "axios";
import { getSession } from "next-auth/react";

const productMutationUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCT_MUTATIONS}`;

export const createProductMutationManual = async (
  body: ProductMutationRequest,
): Promise<ApiResponse<ProductMutationManualResponse>> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.post<ApiResponse<ProductMutationManualResponse>>(
    `${productMutationUrl}/manual`,
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};
