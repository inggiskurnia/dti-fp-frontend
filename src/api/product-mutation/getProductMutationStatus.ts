import axios from "axios";
import { ProductMutationStatus } from "@/types/models/productMutation";
import { ApiResponse } from "@/types/api/apiResponse";
import { getSession } from "next-auth/react";

const productMutationUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCT_MUTATIONS}`;

export const getAllProductMutationStatus = async (): Promise<
  ProductMutationStatus[]
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  try {
    const response = await axios.get<ApiResponse<ProductMutationStatus[]>>(
      `${productMutationUrl}/statuses`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data.data;
  } catch {
    throw new Error("Error fetching product mutation status");
  }
};
