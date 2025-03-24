import { ApiResponse } from "@/types/api/apiResponse";
import { PaginationResponse } from "@/types/api/pagination";
import {
  ProductMutationDetailResponse,
  ProductMutationParams,
  ProductMutationReportDailySummaryResponse,
  ProductMutationHistoryParams,
  ProductMutationReportResponse,
  ProductMutationReportTotalResponse,
  ProductMutationDetailsResponse,
} from "@/types/models/productMutation";
import axios from "axios";
import { getSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

const productMutationUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PRODUCT_MUTATIONS}`;

const axiosInstance = axios.create({
  paramsSerializer: {
    indexes: null,
  },
});

export const getPaginatedProductMutation = async ({
  page,
  limit,
  startDate,
  endDate,
  productId,
  productCategoryId,
  originWarehouseId,
  destinationWarehouseId,
  productMutationTypeId,
  productMutationStatusId,
}: ProductMutationParams): Promise<
  PaginationResponse<ProductMutationDetailResponse>
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axiosInstance.get<
    ApiResponse<PaginationResponse<ProductMutationDetailResponse>>
  >(productMutationUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      page,
      limit,
      startDate,
      endDate,
      productId,
      productCategoryId,
      originWarehouseId,
      destinationWarehouseId,
      productMutationTypeId,
      productMutationStatusId,
    },
  });
  return response.data.data;
};

export const getProductMutationHistory = async ({
  page,
  limit,
  startedAt,
  endedAt,
  productId,
  productCategoryId,
  productMutationTypeId,
  productMutationStatusId,
  destinationWarehouseId,
}: ProductMutationHistoryParams): Promise<
  PaginationResponse<ProductMutationReportResponse>
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.get<
    ApiResponse<PaginationResponse<ProductMutationReportResponse>>
  >(`${productMutationUrl}/history`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      page,
      limit,
      startedAt,
      endedAt,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
      destinationWarehouseId,
    },
  });
  return response.data.data;
};

export const getProductMutationReportTotal = async ({
  startedAt,
  endedAt,
  productId,
  productCategoryId,
  productMutationTypeId,
  productMutationStatusId,
  destinationWarehouseId,
}: ProductMutationHistoryParams): Promise<
  ApiResponse<ProductMutationReportTotalResponse>
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.get<
    ApiResponse<ProductMutationReportTotalResponse>
  >(`${productMutationUrl}/total`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      startedAt,
      endedAt,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
      destinationWarehouseId: destinationWarehouseId,
    },
  });
  return response.data;
};

export const getProductMutationReportDailySummary = async ({
  startedAt,
  endedAt,
  productId,
  productCategoryId,
  productMutationTypeId,
  productMutationStatusId,
  destinationWarehouseId,
}: ProductMutationHistoryParams): Promise<
  ProductMutationReportDailySummaryResponse[]
> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.get<
    ApiResponse<ProductMutationReportDailySummaryResponse[]>
  >(`${productMutationUrl}/daily`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      startedAt,
      endedAt,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
      destinationWarehouseId,
    },
  });

  return response.data.data;
};

export const getDetailProductMutationById = async (
  id: number,
): Promise<ProductMutationDetailsResponse> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  try {
    const response = await axios.get<
      ApiResponse<ProductMutationDetailsResponse>
    >(`${productMutationUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  } catch {
    toast({
      title: "Error",
      description: "Error fetching detail",
      duration: 5000,
      variant: "destructive",
    });
    throw new Error("Error fetching detail ");
  }
};
