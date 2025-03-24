import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductMutationType } from "@/types/models/productMutation";
import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllProductMutationStatus } from "@/api/product-mutation/getProductMutationStatus";
import { useSession } from "next-auth/react";
import { Clock } from "lucide-react";

interface ProductMutationStatusSelectionProps {
  captionNoSelection?: string;
  productMutationSelectionId: number | undefined;
  setProductMutationSelectionId: (id: number | undefined) => void;
}

const ProductMutationStatusSelection: FC<
  ProductMutationStatusSelectionProps
> = ({
  captionNoSelection = "All Product Mutation Status",
  productMutationSelectionId,
  setProductMutationSelectionId,
}) => {
  const { data } = useSession();
  const {
    data: productMutationStatuses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-mutation-statuses"],
    queryFn: getAllProductMutationStatus,
    enabled: !!data?.accessToken,
  });

  return (
    <div className="w-full">
      <Select
        value={
          productMutationSelectionId
            ? productMutationSelectionId.toString()
            : "all"
        }
        onValueChange={(value) => {
          if (value === "all") {
            setProductMutationSelectionId(undefined);
          } else {
            setProductMutationSelectionId(Number(value));
          }
        }}
      >
        <SelectTrigger className="w-full rounded-lg border border-gray-300 bg-white text-gray-500 shadow-sm transition-all hover:border-green-500 focus:ring-2 focus:ring-green-500">
          <div className="flex gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <SelectValue placeholder="Select Product Mutation Staus" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-56">
          <SelectItem value="all">{captionNoSelection}</SelectItem>

          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : isError ? (
            <SelectItem value="error" disabled>
              Error loading product mutation statuses
            </SelectItem>
          ) : productMutationStatuses &&
            productMutationStatuses.length === 0 ? (
            <SelectItem value="no-warehouses" disabled>
              No product mutation status available
            </SelectItem>
          ) : (
            productMutationStatuses?.map(
              (productMutationType: ProductMutationType) => (
                <SelectItem
                  key={productMutationType.id}
                  value={productMutationType.id.toString()}
                >
                  {productMutationType.name}
                </SelectItem>
              ),
            )
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductMutationStatusSelection;
