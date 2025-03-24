import { FC, useEffect, useState } from "react";
import { ChartConfig } from "@/components/ui/chart";
import AreaChartCard from "../common/AreaChartCard";
import { useQuery } from "@tanstack/react-query";
import { getDailyTotalProductMutation } from "@/api/order/getCustomerOrders";
import { useReport } from "@/store/reportStore";
import { useProductMutation } from "@/store/productMutationStore";
import { formatDateHyphen, formatPrice } from "@/utils/formatter";
import { useSession } from "next-auth/react";

const quantityChartConfig = {
  totalQuantity: {
    label: "Quantity",
    color: "#4CAF50",
  },
} satisfies ChartConfig;

const valueChartConfig = {
  totalValue: {
    label: "Value",
    color: "#2196F3",
  },
} satisfies ChartConfig;

const CustomerOrderChart: FC = () => {
  const { dateRange, customerOrderStatusId, productId, productCategoryId } =
    useReport();
  const { destinationWarehouseId } = useProductMutation();
  const { data } = useSession();
  const [accTotalQuantity, setAccTotalQuantity] = useState<number>(0);
  const [accTotalValue, setAccTotalValue] = useState<number>(0);

  const { data: customerOrderTotal } = useQuery({
    queryKey: [
      "order-total",
      dateRange.to,
      dateRange.from,
      destinationWarehouseId,
      customerOrderStatusId,
      productId,
      productId,
    ],
    queryFn: () =>
      getDailyTotalProductMutation({
        startDate: formatDateHyphen(dateRange.from),
        endDate: formatDateHyphen(dateRange.to),
        customerOrderStatusId,
        productId,
        productCategoryId,
        warehouseId: destinationWarehouseId,
        accessToken: data?.accessToken,
      }),
    enabled: !!data?.accessToken,
  });

  useEffect(() => {
    if (customerOrderTotal) {
      const accQuantity = customerOrderTotal.reduce((acc, obj) => {
        return acc + (obj.totalQuantity || 0);
      }, 0);

      const accValue = customerOrderTotal.reduce((acc, obj) => {
        return acc + (obj.totalValue || 0);
      }, 0);

      setAccTotalQuantity(accQuantity);
      setAccTotalValue(accValue);
    }
  }, [customerOrderTotal]);

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="grid-cols-1 rounded bg-blue-50 p-4">
          <h3 className="text-sm text-gray-500">Total Quantity</h3>
          <p className="text-2xl font-bold">{accTotalQuantity}</p>
        </div>
        <div className="col-span-2 rounded bg-blue-50 p-4 md:col-span-1">
          <h3 className="text-sm text-gray-500">Total Value</h3>
          <p className="text-2xl font-bold">
            {formatPrice(accTotalValue.toString())}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <AreaChartCard
          title="Total Quantity Order Over Time"
          description="Showing daily changes in total quantity customer order"
          data={customerOrderTotal ?? []}
          dataKey="totalQuantity"
          config={quantityChartConfig}
        />

        <AreaChartCard
          title="Total Value Order Over Time"
          description="Showing daily changes in total value customer order"
          data={customerOrderTotal ?? []}
          dataKey="totalValue"
          config={valueChartConfig}
        />
      </div>
    </div>
  );
};

export default CustomerOrderChart;
