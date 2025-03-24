"use client";

import { getProductDetailById } from "@/api/product/getProducts";
import ProductManagementHeader from "@/components/product-management/ProductManagementHeader";
import ProductCarousel from "@/components/product/ProductCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDimension, formatPrice, formatWeight } from "@/utils/formatter";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { FC } from "react";

const ProductAdmin: FC = () => {
  const { productId } = useParams();

  const { data: productDetail, isLoading: productDetailLoading } = useQuery({
    queryKey: ["product"],
    queryFn: () => getProductDetailById({ productId: Number(productId) }),
  });

  return (
    <section className="w-full space-y-2 rounded-lg px-4 py-2 shadow-sm sm:py-4 md:py-7">
      <ProductManagementHeader />

      {!productDetail || productDetailLoading ? (
        <div className="flex flex-col space-y-4 p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-178px)] items-center rounded-lg bg-white">
          <div className="grid w-full grid-cols-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-2 md:gap-8 md:px-8 lg:px-12 xl:px-20">
            <div className="flex w-full justify-center">
              <div className="w-[80%]">
                {productDetail && (
                  <ProductCarousel
                    productName={productDetail.name ?? "product"}
                    images={productDetail.images ?? []}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6">
              <h1 className="font-poppins text-xl font-semibold sm:text-2xl md:text-3xl lg:text-4xl">
                {productDetail?.name}
              </h1>
              <p className="text-sm text-gray-600 sm:text-base md:text-lg">
                {productDetail?.description}
              </p>
              <h2 className="font-poppins text-xl font-medium sm:text-2xl md:text-3xl">
                {formatPrice(String(productDetail.price))}
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h2 className="mb-1 text-sm font-semibold text-gray-700 sm:text-base">
                    Dimensions
                  </h2>
                  <div className="flex gap-2 text-sm sm:text-base">
                    <p>{formatDimension(productDetail.length)} x</p>
                    <p>{formatDimension(productDetail.width)} x</p>
                    <p>{formatDimension(productDetail.height)}</p>
                  </div>
                </div>

                <div>
                  <h2 className="mb-1 text-sm font-semibold text-gray-700 sm:text-base">
                    Weight
                  </h2>
                  <p className="text-sm sm:text-base">
                    {formatWeight(productDetail.weight)}
                  </p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:gap-x-6 sm:text-sm md:gap-x-8">
                <p className="text-gray-600">Category</p>
                <p>{productDetail.category.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductAdmin;
