"use client";

import { getPaginatedProductMutation } from "@/api/product-mutation/getProductMutation";
import ProductMutationCard from "@/components/product-mutation/ProductMutationCard";
import ProductMutationHeader from "@/components/product-mutation/ProductMutationHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ADMIN_PRODUCT_MUTATION,
  ADMIN_PRODUCT_MUTATION_REPORT_PER_PAGE,
} from "@/constant/productConstant";
import { cn } from "@/lib/utils";
import { useProductMutation } from "@/store/productMutationStore";
import { useQuery } from "@tanstack/react-query";
import React, { FC, useState } from "react";
import { AlertCircle } from "lucide-react";
import { PaginationAdmin } from "@/components/pagination/PaginationAdmin";
import { ProductMutationDetailResponse } from "@/types/models/productMutation";
import { PaginationResponse } from "@/types/api/pagination";
import { ProductMutationConstant } from "@/constant/productMutationConstant";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import ProductMutationFilterSelection from "@/components/product-mutation/ProductMutationFilterSelection";
import { useProductMutationFilter } from "@/store/productMutationFilterStore";
import { formatDateHyphen } from "@/utils/formatter";

const ProductMutation: FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(1);
  const {
    dateRange,
    productId,
    productCategoryId,
    productMutationTypeId,
    productMutationStatusId,
  } = useProductMutationFilter();
  const { data } = useSession();
  const {
    destinationWarehouseId,
    submitMutation,
    productMutationPage,
    setProductMutationPage,
  } = useProductMutation();

  const {
    data: adjustmentJournals,
    isLoading: isLoadingJournals,
    isError: isErrorJournals,
  } = useQuery({
    queryKey: [
      "inventory-journal",
      destinationWarehouseId,
      selectedTab,
      productMutationPage,
      submitMutation,
      dateRange,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
    ],
    queryFn: () =>
      getPaginatedProductMutation({
        page: productMutationPage,
        limit: ADMIN_PRODUCT_MUTATION,
        startDate: formatDateHyphen(dateRange.from),
        endDate: formatDateHyphen(dateRange.to),
        productId,
        productCategoryId,
        destinationWarehouseId: destinationWarehouseId,
        productMutationTypeId: [
          ProductMutationConstant.TYPE_CREATE_INVENTORY,
          ProductMutationConstant.TYPE_UPDATE_INVENTORY,
          ProductMutationConstant.TYPE_DELETE_INVENTORY,
        ],
      }),
    enabled: !!destinationWarehouseId && !!data?.accessToken,
  });

  const {
    data: inboundMutation,
    isLoading: isLoadingInbound,
    isError: isErrorInbound,
  } = useQuery({
    queryKey: [
      "inbound-mutation",
      destinationWarehouseId,
      selectedTab,
      productMutationPage,
      submitMutation,
      dateRange,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
    ],
    queryFn: () =>
      getPaginatedProductMutation({
        page: productMutationPage,
        limit: ADMIN_PRODUCT_MUTATION,
        startDate: formatDateHyphen(dateRange.from),
        endDate: formatDateHyphen(dateRange.to),
        productId,
        productCategoryId,
        destinationWarehouseId: destinationWarehouseId,
        productMutationTypeId: [
          ProductMutationConstant.TYPE_INBOUND_MANUAL_MUTATION,
          ProductMutationConstant.TYPE_INBOUND_AUTO_MUTATION,
        ],
        productMutationStatusId: productMutationStatusId,
      }),
    enabled: !!destinationWarehouseId && !!data?.accessToken,
  });

  const {
    data: outboundMutation,
    isLoading: isLoadingOutbound,
    isError: isErrorOutbound,
  } = useQuery({
    queryKey: [
      "outbound-mutation",
      destinationWarehouseId,
      selectedTab,
      productMutationPage,
      submitMutation,
      dateRange,
      productId,
      productCategoryId,
      productMutationTypeId,
      productMutationStatusId,
    ],
    queryFn: () =>
      getPaginatedProductMutation({
        page: productMutationPage,
        limit: ADMIN_PRODUCT_MUTATION,
        startDate: formatDateHyphen(dateRange.from),
        endDate: formatDateHyphen(dateRange.to),
        productId,
        productCategoryId,
        originWarehouseId: destinationWarehouseId,
        productMutationTypeId: [
          ProductMutationConstant.TYPE_OUTBOUND_MANUAL_MUTATION,
          ProductMutationConstant.TYPE_OUTBOUND_AUTO_MUTATION,
        ],
        productMutationStatusId: productMutationStatusId,
      }),
    enabled: !!destinationWarehouseId && !!data?.accessToken,
  });

  const tabOptions = [
    { id: 1, value: "journal", label: "Adjustment" },
    { id: 2, value: "inbound", label: "Inbound" },
    { id: 3, value: "outbound", label: "Outbound" },
  ];

  const renderWarehouseNotSelected = () => (
    <Alert variant="destructive" className="mx-auto my-16 max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Please select warehouse!</AlertDescription>
    </Alert>
  );

  const renderSkeletonLoading = () => (
    <div className="flex w-full flex-col items-center justify-center gap-4 sm:gap-8">
      {Array(ADMIN_PRODUCT_MUTATION_REPORT_PER_PAGE)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex w-[95%] flex-col space-y-2 sm:w-[90%] sm:space-y-3 md:w-[80%]"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Skeleton className="h-12 w-12 rounded-md sm:h-16 sm:w-16" />
              <div className="space-y-1 sm:space-y-2">
                <Skeleton className="h-3 w-[180px] sm:h-4 sm:w-[250px]" />
                <Skeleton className="h-2 w-[120px] sm:h-3 sm:w-[150px]" />
                <Skeleton className="h-5 w-[80px] rounded-full sm:h-6 sm:w-[100px]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-[60px] sm:h-4 sm:w-[80px]" />
              <div className="flex space-x-1 sm:space-x-2">
                <Skeleton className="h-7 w-16 rounded-md sm:h-9 sm:w-20" />
                <Skeleton className="h-7 w-16 rounded-md sm:h-9 sm:w-20" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  const renderError = () => (
    <Alert variant="destructive" className="mx-auto my-16 max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Failed to load product mutation. Please try again.
      </AlertDescription>
    </Alert>
  );

  const renderEmptyState = () => (
    <div className="py-16 text-center text-gray-500">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium">No product mutation found</h3>
    </div>
  );

  const renderContent = (
    data: PaginationResponse<ProductMutationDetailResponse> | undefined,
    isLoading: boolean,
    isError: boolean,
    isInbound: boolean,
  ) => {
    return (
      <section className="flex min-h-[calc(100vh-155px)] w-full flex-col justify-between rounded-lg bg-white px-4 pt-2 md:px-7">
        <div
          className={`flex w-full flex-grow ${!data || data.content.length === 0 || isLoading || isError ? "items-center justify-center" : "items-start justify-center"}`}
        >
          {!destinationWarehouseId
            ? renderWarehouseNotSelected()
            : isLoading
              ? renderSkeletonLoading()
              : isError
                ? renderError()
                : data && data.content.length === 0
                  ? renderEmptyState()
                  : data && (
                      <div className="grid w-[90%] grid-cols-1 gap-4">
                        {data.content.map(
                          (item: ProductMutationDetailResponse) => (
                            <ProductMutationCard
                              key={item.productMutationId}
                              productMutation={item}
                              isInbound={isInbound}
                            />
                          ),
                        )}
                      </div>
                    )}
        </div>
        {data && data.content.length > 0 && (
          <div className="py-2">
            <PaginationAdmin
              desc="mutation"
              page={productMutationPage}
              setPage={setProductMutationPage}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              currentPageSize={data.content.length}
            />
          </div>
        )}
      </section>
    );
  };

  return (
    <section className="w-full space-y-2 rounded-lg shadow-sm">
      <ProductMutationHeader />

      <Tabs defaultValue="journal" className="w-full">
        <div className="space-y-2">
          <TabsList className="grid h-12 w-full grid-cols-3 rounded-lg bg-white shadow-sm sm:h-14">
            {tabOptions.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.value}
                className={cn(
                  "relative line-clamp-1 h-full rounded-none font-medium",
                  "data-[state=active]:border-b-2 data-[state=active]:border-warehub-green data-[state=active]:text-emerald-700",
                  "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
                onClick={() => {
                  setProductMutationPage(0);
                  setSelectedTab(tab.id);
                }}
              >
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="w-full rounded-xl bg-white shadow-sm">
            <ProductMutationFilterSelection selectedTab={selectedTab} />

            <TabsContent value="journal">
              {renderContent(
                adjustmentJournals,
                isLoadingJournals,
                isErrorJournals,
                false,
              )}
            </TabsContent>

            <TabsContent value="inbound">
              {renderContent(
                inboundMutation,
                isLoadingInbound,
                isErrorInbound,
                true,
              )}
            </TabsContent>

            <TabsContent value="outbound">
              {renderContent(
                outboundMutation,
                isLoadingOutbound,
                isErrorOutbound,
                false,
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </section>
  );
};

export default ProductMutation;
