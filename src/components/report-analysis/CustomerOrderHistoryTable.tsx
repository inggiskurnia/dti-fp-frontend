import { FC, useState } from "react";
import { useSession } from "next-auth/react";
import { useReport } from "@/store/reportStore";
import { useProductMutation } from "@/store/productMutationStore";
import { useQuery } from "@tanstack/react-query";
import { getHistoryCustomerOrders } from "@/api/order/getCustomerOrders";
import { ADMIN_CUSTOMER_ORDER_REPORT_PER_PAGE } from "@/constant/productConstant";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationAdmin } from "@/components/pagination/PaginationAdmin";
import { CustomerOrderHistoryResponse } from "@/types/models/orders/orders";
import {
  formatDateHyphen,
  formatDateString,
  formatPrice,
} from "@/utils/formatter";

const CustomerOrderHistoryTable: FC = () => {
  const [page, setPage] = useState<number>(0);
  const { data } = useSession();
  const { dateRange, productId, productCategoryId, customerOrderStatusId } =
    useReport();
  const { destinationWarehouseId } = useProductMutation();

  const {
    data: customerOrders,
    isError: customerOrderIsError,
    isLoading: customerOrderIsLoading,
  } = useQuery({
    queryKey: [
      "customer-order-chart",
      page,
      destinationWarehouseId,
      dateRange.from,
      dateRange.to,
      productId,
      productCategoryId,
      customerOrderStatusId,
    ],
    queryFn: () =>
      getHistoryCustomerOrders({
        page: page,
        limit: ADMIN_CUSTOMER_ORDER_REPORT_PER_PAGE,
        startDate: formatDateHyphen(dateRange.from),
        endDate: formatDateHyphen(dateRange.to),
        customerOrderStatusId: customerOrderStatusId,
        productId: productId,
        productCategoryId: productCategoryId,
        warehouseId: destinationWarehouseId,
        accessToken: data?.accessToken,
      }),
    enabled: !!data?.accessToken,
  });
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      {customerOrderIsLoading ? (
        <div>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>

          <Skeleton className={"h-40 w-full"} />

          <div className="flex flex-col gap-4">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        </div>
      ) : customerOrderIsError ? (
        <div>Error loading sales history</div>
      ) : (
        customerOrders && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice Code</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Product Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerOrders?.content.map(
                  (customerOrder: CustomerOrderHistoryResponse, index) => (
                    <TableRow key={`${customerOrder.orderId}-${index}`}>
                      <TableCell>
                        {formatDateString(customerOrder.dateTime.toString())}
                      </TableCell>
                      <TableCell>{customerOrder.invoiceCode}</TableCell>
                      <TableCell>{customerOrder.orderStatusName}</TableCell>
                      <TableCell>{customerOrder.productName}</TableCell>
                      <TableCell>{customerOrder.productCategoryName}</TableCell>
                      <TableCell>{customerOrder.quantity}</TableCell>
                      <TableCell>
                        {formatPrice(customerOrder.unitPrice.toString())}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>

            {customerOrders && customerOrders.content.length > 0 && (
              <PaginationAdmin
                desc="History"
                page={page}
                setPage={setPage}
                totalPages={customerOrders.totalPages}
                totalElements={customerOrders.totalElements}
                currentPageSize={customerOrders.content.length}
              />
            )}
          </>
        )
      )}
    </div>
  );
};

export default CustomerOrderHistoryTable;
