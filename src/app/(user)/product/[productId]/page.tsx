"use client";

import { getProductDetailById } from "@/api/product/getProducts";
import ProductCarousel from "@/components/product/ProductCarousel";
import { LOCATION_RADIUS } from "@/constant/locationConstant";
import { cn } from "@/lib/utils";
import { CartItem, useCartStore } from "@/store/cartStore";
import { useUserAddressStore } from "@/store/userAddressStore";
import { ProductDetail, ProductSummary } from "@/types/models/products";
import { formatDimension, formatPrice, formatWeight } from "@/utils/formatter";
import { useQuery } from "@tanstack/react-query";
import { redirect, useParams } from "next/navigation";
import { FC, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const InventoryPage: FC = () => {
  const session = useSession();
  const { productId } = useParams();
  const [cartQuantity, setCartQuantity] = useState<number>(1);
  const { userAddress } = useUserAddressStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const {
    data: productDetail,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["productDetail", productId],
    queryFn: () =>
      getProductDetailById({
        productId: Number(productId),
        longitude: userAddress?.longitude,
        latitude: userAddress?.latitude,
        radius: LOCATION_RADIUS,
      }),
  });

  const handleAddToCart = (product: ProductDetail | undefined) => {
    if (session.status === "unauthenticated") {
      redirect("/login");
    }

    if (!product) return;

    const productItem: ProductSummary = {
      id: product.id,
      name: product.name,
      price: product.price,
      totalStock: product.totalStock,
      thumbnail: product.images?.find((image) => image.position === 1)?.url,
      categoryName: product.category.name,
    };

    const cartItem: CartItem = {
      product: productItem,
      cartQuantity: cartQuantity,
    };
    addToCart(cartItem);
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)] w-full flex-col p-5 md:p-0">
      <div className="mx-auto max-w-7xl px-4 pt-0 md:pt-16">
        {!productDetail || isLoading || isFetching ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex w-full justify-center">
              <div className="w-full max-w-md">
                <Skeleton className="aspect-square w-full rounded-md" />
                <div className="mt-4 flex justify-center space-x-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-2 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <Skeleton className="h-8 w-3/4 md:h-10" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <Skeleton className="h-8 w-1/3 md:h-10" />

              <div className="space-y-6">
                <div>
                  <Skeleton className="mb-2 h-5 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div>
                  <Skeleton className="mb-2 h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              <div className="flex flex-col gap-4 py-6 md:flex-row">
                <Skeleton className="h-12 w-full md:w-32" />
                <Skeleton className="h-12 w-full" />
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex w-full justify-center">
              <div className="w-full max-w-md">
                {productDetail && (
                  <ProductCarousel
                    productName={productDetail.name ?? "product"}
                    images={productDetail.images ?? []}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h1 className="font-poppins text-2xl font-semibold md:text-4xl">
                {productDetail?.name}
              </h1>
              <p className="text-base text-gray-600 md:text-lg">
                {productDetail?.description}
              </p>
              <h2
                className={cn(
                  "font-poppins text-2xl font-medium md:text-3xl",
                  productDetail.totalStock > 0
                    ? ""
                    : "font-semibold text-red-500",
                )}
              >
                {productDetail.totalStock > 0
                  ? formatPrice(String(productDetail.price))
                  : "Out of Stock"}
              </h2>

              <div className="space-y-4">
                <div>
                  <h2 className="mb-1 font-semibold text-gray-700">
                    Dimensions
                  </h2>
                  <div className="flex gap-2">
                    <p>{formatDimension(productDetail.length)} x</p>
                    <p>{formatDimension(productDetail.width)} x</p>
                    <p>{formatDimension(productDetail.height)}</p>
                  </div>
                </div>

                <div>
                  <h2 className="mb-1 font-semibold text-gray-700">Weight</h2>
                  <p>{formatWeight(productDetail.weight)}</p>
                </div>
              </div>

              <div className="flex gap-4 py-6">
                <div className="flex h-12 items-center rounded-md border border-gray-300">
                  <button
                    className={cn(
                      "px-4 py-1 text-xl transition-colors",
                      cartQuantity <= 1
                        ? "cursor-not-allowed text-gray-300"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                    disabled={cartQuantity <= 1}
                    onClick={(e) => {
                      if (session.status === "unauthenticated") {
                        redirect("/login");
                      }
                      e.preventDefault();
                      setCartQuantity(cartQuantity - 1);
                    }}
                  >
                    -
                  </button>

                  <input
                    type="text"
                    value={cartQuantity}
                    readOnly
                    className="pointer-events-none w-12 border-x border-gray-300 text-center"
                  />

                  <button
                    className={cn(
                      "px-4 py-1 text-xl transition-colors",
                      cartQuantity >= productDetail.totalStock
                        ? "cursor-not-allowed text-gray-300"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                    disabled={cartQuantity >= productDetail.totalStock}
                    onClick={(e) => {
                      if (session.status === "unauthenticated") {
                        redirect("/login");
                      }
                      e.preventDefault();
                      setCartQuantity(cartQuantity + 1);
                    }}
                  >
                    +
                  </button>
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(productDetail);
                  }}
                  disabled={cartQuantity > productDetail.totalStock}
                >
                  Add to Cart
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <p className="text-gray-600">Remaining stock</p>
                <p>{productDetail.totalStock}</p>
                <p className="text-gray-600">Category</p>
                <p>{productDetail.category.name}</p>
                {productDetail.nearestWarehouse && (
                  <>
                    <p className="text-gray-600">Nearest available warehouse</p>
                    <p>{productDetail.nearestWarehouse.name}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
