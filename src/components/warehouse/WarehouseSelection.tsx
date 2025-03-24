import React, { FC, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAllWarehouses } from "@/api/warehouse/getWarehouses";
import { useSession } from "next-auth/react";
import { useProductMutation } from "@/store/productMutationStore";
import { userRoles } from "@/constant/userConstant";
import { Warehouse } from "lucide-react";

interface WarehouseSelectionProps {
  captionNoSelection?: string;
  warehouseId: number | undefined;
  setWarehouseId: (id: number | undefined) => void;
  setPage?: (page: number) => void;
}

const WarehouseSelection: FC<WarehouseSelectionProps> = ({
  captionNoSelection = "Select Warehouse",
  warehouseId,
  setWarehouseId,
  setPage,
}) => {
  const { data } = useSession();
  const { setDestinationWarehouseId } = useProductMutation();
  const {
    data: warehouses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getAllWarehouses,
  });

  useEffect(() => {
    if (data?.userDetail?.warehouseId && data.role !== "ADMIN_SUPER") {
      setDestinationWarehouseId(data?.userDetail?.warehouseId);
    }
  }, [data, setDestinationWarehouseId]);

  return (
    <div className="w-full">
      <Select
        disabled={data?.role !== userRoles.ADMIN_SUPER}
        value={warehouseId ? warehouseId.toString() : "all"}
        onValueChange={(value) => {
          if (value === "all") {
            setWarehouseId(undefined);
          } else {
            setWarehouseId(Number(value));
          }
          if (setPage) {
            setPage(0);
          }
        }}
      >
        <SelectTrigger className="w-full rounded-lg border border-gray-300 bg-white text-gray-500 shadow-sm transition-all hover:border-green-500 focus:ring-2 focus:ring-green-500">
          <div className="flex items-center justify-center gap-2">
            <Warehouse className="h-5 w-5 text-gray-400" />
            <SelectValue placeholder="Select Warehouse" />
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
              Error loading warehouses
            </SelectItem>
          ) : warehouses?.data && warehouses.data.length === 0 ? (
            <SelectItem value="no-warehouses" disabled>
              No warehouses available
            </SelectItem>
          ) : (
            warehouses?.data?.map((warehouse) => (
              <SelectItem
                key={warehouse.id}
                value={warehouse.id.toString()}
                className="line-clamp-1"
              >
                {warehouse.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WarehouseSelection;
