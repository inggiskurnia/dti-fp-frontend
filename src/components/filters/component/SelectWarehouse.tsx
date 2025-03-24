import React, { FC } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useOrderStore } from "@/store/orderStore";
import { getAllWarehouses } from "@/api/warehouse/getWarehouses";

const SelectWarehouse: FC = () => {
  const { warehouseId, setFilters } = useOrderStore();

  const {
    data: warehouses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getAllWarehouses,
    staleTime: 1000 * 60 * 2, // Cache results for 2 minutes
  });

  return (
    <div>
      <Select
        value={warehouseId ? warehouseId.toString() : "all"}
        onValueChange={(value) =>
          setFilters({
            warehouseId: value !== "all" ? Number(value) : undefined,
            page: 0,
            limit: 10,
          })
        }
      >
        <SelectTrigger className="w-full rounded-lg border border-gray-300 bg-white px-3 py-[26px] text-lg text-gray-600 shadow-sm transition-all hover:border-green-500 focus:ring-2 focus:ring-green-500">
          <SelectValue placeholder="Select Warehouse" />
        </SelectTrigger>
        <SelectContent>
          {/* Provide a clear option */}
          <SelectItem value="all">All Warehouses</SelectItem>

          {/* Ensure all warehouse IDs are strings */}
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : isError ? (
            <SelectItem value="error" disabled>
              Error loading warehouses
            </SelectItem>
          ) : (
            warehouses?.data.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                {warehouse.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectWarehouse;
