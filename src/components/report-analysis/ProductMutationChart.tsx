import { FC } from "react";
import { useReport } from "@/store/reportStore";
import { useProductMutation } from "@/store/productMutationStore";
import { useQuery } from "@tanstack/react-query";
import { getProductMutationReportDailySummary } from "@/api/product-mutation/getProductMutation";
import { formatDateHyphen } from "@/utils/formatter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useSession } from "next-auth/react";

const chartConfig = {
  added: {
    label: "Added",
    color: "#4CAF50",
  },
  reduced: {
    label: "Reduced",
    color: "#F44336",
  },
} satisfies ChartConfig;

const ProductMutationChart: FC = () => {
  const {
    dateRange,
    productMutationTypeId,
    productMutationStatusId,
    productId,
    productCategoryId,
  } = useReport();
  const { destinationWarehouseId } = useProductMutation();
  const { data } = useSession();

  const { data: mutationDailySummary } = useQuery({
    queryKey: [
      "mutation-summary",
      dateRange,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
      destinationWarehouseId,
    ],
    queryFn: () =>
      getProductMutationReportDailySummary({
        startedAt: formatDateHyphen(dateRange.from),
        endedAt: formatDateHyphen(dateRange.to),
        productId,
        productCategoryId,
        productMutationTypeId,
        productMutationStatusId,
        destinationWarehouseId,
      }),
    enabled: !!dateRange.from && !!dateRange.to && !!data?.accessToken,
  });

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="text-md font-semibold">
            Inventory Quantity Over Time
          </CardTitle>
          <CardDescription>
            Showing daily changes inventory quantities
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={mutationDailySummary ?? []}>
            <defs>
              <linearGradient id="fillAdded" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.added.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.added.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillReduced" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.reduced.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.reduced.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <YAxis />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="added"
              type="monotone"
              fill="url(#fillAdded)"
              stroke={chartConfig.added.color}
            />

            <Area
              dataKey="reduced"
              type="monotone"
              fill="url(#fillReduced)"
              stroke={chartConfig.reduced.color}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProductMutationChart;
