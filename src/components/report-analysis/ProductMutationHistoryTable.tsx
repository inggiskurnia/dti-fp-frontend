import { getProductMutationHistory } from "@/api/product-mutation/getProductMutation";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReport } from "@/store/reportStore";
import { useProductMutation } from "@/store/productMutationStore";
import { formatDateHyphen, formatDateString } from "@/utils/formatter";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_PRODUCT_MUTATION_REPORT_PER_PAGE } from "@/constant/productConstant";
import { useState } from "react";
import { PaginationAdmin } from "@/components/pagination/PaginationAdmin";
import { ProductMutationReportResponse } from "@/types/models/productMutation";
import StatusComponent from "@/components/common/StatusComponent";

export default function ProductMutationHistoryTable() {
  const [page, setPage] = useState<number>(0);
  const {
    dateRange,
    productMutationTypeId,
    productMutationStatusId,
    productId,
    productCategoryId,
  } = useReport();
  const { destinationWarehouseId } = useProductMutation();

  const {
    data: mutationHistory,
    isLoading: mutationHistoryIsLoading,
    isError: mutationHistoryIsError,
  } = useQuery({
    queryKey: [
      "mutation-history",
      page,
      dateRange,
      destinationWarehouseId,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
    ],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) {
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        };
      }
      return await getProductMutationHistory({
        page,
        limit: ADMIN_PRODUCT_MUTATION_REPORT_PER_PAGE,
        startedAt: formatDateHyphen(dateRange.from),
        endedAt: formatDateHyphen(dateRange.to),
        productId,
        productCategoryId,
        productMutationTypeId,
        productMutationStatusId,
        destinationWarehouseId,
      });
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      {mutationHistoryIsLoading ? (
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
      ) : mutationHistoryIsError ? (
        <div>Error loading mutation history</div>
      ) : (
        mutationHistory && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Mutation Type</TableHead>
                  <TableHead>Mutation Status</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mutationHistory?.content.map(
                  (history: ProductMutationReportResponse) => (
                    <TableRow key={history.id}>
                      <TableCell>
                        {formatDateString(history.createdAt)}
                      </TableCell>
                      <TableCell>{history.product.name}</TableCell>
                      <TableCell>{history.productCategory.name}</TableCell>
                      <TableCell>{history.productMutationType.name}</TableCell>
                      <TableCell>
                        <StatusComponent
                          name={history.productMutationStatus.name}
                        />
                      </TableCell>
                      <TableCell>{history.quantity}</TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>

            {mutationHistory && mutationHistory.content.length > 0 && (
              <PaginationAdmin
                desc="History"
                page={page}
                setPage={setPage}
                totalPages={mutationHistory.totalPages}
                totalElements={mutationHistory.totalElements}
                currentPageSize={mutationHistory.content.length}
              />
            )}
          </>
        )
      )}
    </div>
  );
}
