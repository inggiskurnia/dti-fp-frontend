import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReport } from "@/store/reportStore";
import { useProductMutation } from "@/store/productMutationStore";
import { getProductMutationReportTotal } from "@/api/product-mutation/getProductMutation";
import { formatDateHyphen } from "@/utils/formatter";
import { useSession } from "next-auth/react";

const ProductMutationTotal: FC = () => {
  const {
    dateRange,
    productId,
    productCategoryId,
    productMutationTypeId,
    productMutationStatusId,
  } = useReport();

  const { destinationWarehouseId } = useProductMutation();
  const { data } = useSession();

  const {
    data: mutationTotal,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "mutation-total",
      dateRange,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
      destinationWarehouseId,
    ],
    queryFn: () => {
      if (!dateRange.from || !dateRange.to) {
        return Promise.resolve(null);
      }
      return getProductMutationReportTotal({
        startedAt: formatDateHyphen(dateRange.from),
        endedAt: formatDateHyphen(dateRange.to),
        productId,
        productCategoryId,
        productMutationTypeId,
        productMutationStatusId,
        destinationWarehouseId,
      });
    },
    enabled: !!dateRange.from && !!dateRange.to && !!data?.accessToken,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error occurred while fetching data.</div>;
  }

  return (
    <div className="mb-6 grid grid-cols-3 gap-4">
      <div className="rounded bg-blue-50 p-4">
        <h3 className="text-sm text-gray-500">Total Added</h3>
        <p className="text-2xl font-bold">{mutationTotal?.data.added}</p>
      </div>
      <div className="rounded bg-blue-50 p-4">
        <h3 className="text-sm text-gray-500">Total Reduced</h3>
        <p className="text-2xl font-bold">{mutationTotal?.data.reduced}</p>
      </div>
      <div className="rounded bg-blue-50 p-4">
        <h3 className="text-sm text-gray-500">Ending Total Stock</h3>
        <p className="text-2xl font-bold">{mutationTotal?.data.ending}</p>
      </div>
    </div>
  );
};

export default ProductMutationTotal;
