import { getAllCustomerOrders } from "@/api/order/getCustomerOrders";
import { useQuery } from "@tanstack/react-query";

export const useOrders = (
  page: number,
  limit: number,
  accessToken?: string,
  status?: number,
  search?: string,
  startDate?: Date,
  endDate?: Date,
  warehouseId?: number,
) => {
  return useQuery({
    queryKey: [
      "orders",
      page,
      limit,
      accessToken,
      status,
      search,
      startDate,
      endDate,
      warehouseId,
    ],
    queryFn: () =>
      getAllCustomerOrders(
        page,
        limit,
        accessToken!,
        status,
        search,
        startDate,
        endDate,
        warehouseId,
      ),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2, // Cache results for 2 minutes
  });
};
