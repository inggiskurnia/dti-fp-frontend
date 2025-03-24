import { toast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/api/apiResponse";
import {
  ProductMutationDetailResponse,
  ProductMutationProcessRequest,
} from "@/types/models/productMutation";
import axios from "axios";
import { getSession } from "next-auth/react";

const productMutationUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCT_MUTATIONS}`;

interface ProcessMutationRequest extends ProductMutationProcessRequest {
  productMutationId: number;
}

export const approveManualProductMutation = async ({
  userId,
  notes,
  productMutationId,
}: ProcessMutationRequest): Promise<
  ApiResponse<ProductMutationDetailResponse>
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  try {
    const response = await axios.put<
      ApiResponse<ProductMutationDetailResponse>
    >(
      `${productMutationUrl}/manual/approve/${productMutationId}`,
      {
        userId,
        notes,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    toast({
      title: "Approve Mutation success",
      description: "Successfully move product",
      duration: 5000,
    });
    return response.data;
  } catch (error) {
    console.error("Error approving manual product mutation:", error);
    throw error;
  }
};

export const declineManualProductMutation = async ({
  userId,
  notes,
  productMutationId,
}: ProcessMutationRequest): Promise<
  ApiResponse<ProductMutationDetailResponse>
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  try {
    const response = await axios.put<
      ApiResponse<ProductMutationDetailResponse>
    >(
      `${productMutationUrl}/manual/decline/${productMutationId}`,
      {
        userId,
        notes,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error declining manual product mutation:", error);
    throw error;
  }
};
