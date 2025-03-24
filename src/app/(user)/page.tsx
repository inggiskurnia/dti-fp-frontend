"use client";

import { useEffect } from "react";
import { INVENTORY_PER_PAGE } from "@/constant/warehouseInventoryConstant";

import { CartItem, useCartStore } from "@/store/cartStore";
import { useQuery } from "@tanstack/react-query";
import { useUserAddressStore } from "@/store/userAddressStore";
import { ProductSummary } from "@/types/models/products";
import { LOCATION_RADIUS } from "@/constant/locationConstant";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import DeliveryLocationDialog from "@/components/location/DeliveryLocationDialog";
import { useProductUser } from "@/store/productUserStore";
import PaginationComponent from "@/components/lists/order-list/PaginationComponent";
import ProductCategoryUserSelection from "@/components/product/ProductCategoryUserSelection";
import ProductCategorySelection from "@/components/product-management/categories/ProductCategorySelection";
import ProductCardLoading from "@/components/product/ProductCardLoading";
import ProductCard from "@/components/product/productCard";
import { getNearbyProduct } from "@/api/product/getProducts";

export default function Home() {
  const { data: session } = useSession();
  const addToCart = useCartStore((state) => state.addToCart);
  const { setCartItems } = useCartStore();
  const { userAddress } = useUserAddressStore();
  const {
    productPage,
    searchQuery,
    productCategoryId,
    setProductPage,
    setProductCategoryId,
  } = useProductUser();

  useEffect(() => {
    useCartStore.getState().isUserVerified =
      session?.role === "CUSTOMER_VERIFIED";
    useCartStore.getState().isUserRegistered = !session;
  }, [session]);

  const handleAddToCart = (product: ProductSummary) => {
    const cartItem: CartItem = {
      product: product,
      cartQuantity: 1,
    };
    addToCart(cartItem);
  };

  const {
    data: products,
    isLoading: productsLoading,
    isFetching: productsFetching,
  } = useQuery({
    queryKey: [
      "nearby-products",
      productPage,
      productCategoryId,
      searchQuery,
      userAddress,
    ],
    queryFn: () =>
      getNearbyProduct({
        page: productPage,
        limit: INVENTORY_PER_PAGE,
        longitude: userAddress?.longitude,
        latitude: userAddress?.latitude,
        radius: LOCATION_RADIUS,
        productCategoryId: productCategoryId || undefined,
        searchQuery: searchQuery !== "" ? searchQuery : undefined,
      }),
    staleTime: 120000,
  });

  useEffect(() => {
    const currentCart = localStorage.getItem("cart-storage");
    if (currentCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(currentCart);

        if (Array.isArray(parsedCart) && products?.content) {
          const updatedCart: CartItem[] = parsedCart.map((item) => {
            const updatedProduct = products.content.find(
              (product) => product.id === item.product.id,
            );
            if (updatedProduct) {
              return { ...item, product: updatedProduct };
            }
            return { ...item, product: { ...item.product, totalStock: 0 } };
          });
          setCartItems(updatedCart);
        }
      } catch (err) {
        console.error("Error parsing cart-storage:", err);
        toast({
          title: "Error parsing cart storage",
          description: `${err}`,
        });
      }
    }
  }, [products, setCartItems]);

  useEffect(() => {
    window.scrollTo({ top: 20, behavior: "smooth" });
  }, [productPage, productCategoryId, searchQuery, userAddress]);

  return (
    <>
      <div className="mb-12 mt-4 min-h-[calc(100vh-70px)] w-full">
        <main className="mx-auto mt-10 flex w-full max-w-[1340px] items-center justify-center md:px-6">
          <div className="grid w-full grid-cols-1 gap-8 px-8 md:grid-cols-4">
            <div className="flex h-fit flex-col gap-4 md:sticky md:top-24 md:col-span-1 md:gap-8">
              <div className="flex flex-col gap-2">
                <h1 className="mb-1 text-xl font-bold">Categories</h1>
                <div className="hidden w-full md:block">
                  <ProductCategoryUserSelection />
                </div>
                <div className="w-full flex-col md:hidden">
                  <ProductCategorySelection
                    productCategoryId={productCategoryId}
                    setProductCategoryId={setProductCategoryId}
                    showIcon={false}
                    setPage={setProductPage}
                  />
                </div>
              </div>

              <div className="w-full space-y-2">
                <label
                  htmlFor="address-select"
                  className="mb-1 block text-lg font-semibold"
                >
                  Delivery Address
                </label>
                <DeliveryLocationDialog />
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:min-h-[calc(100vh-150px)] lg:grid-cols-3">
                {productsLoading || productsFetching
                  ? [...Array(INVENTORY_PER_PAGE)].map((_, index) => (
                      <ProductCardLoading key={index} />
                    ))
                  : products?.content.map((product) => (
                      <div key={product.id}>
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          price={product.price}
                          thumbnail={product.thumbnail ?? "/no-image-icon.jpg"}
                          totalStock={product.totalStock}
                          nearestWarehouseName={product.nearestWarehouseName}
                          onAddToCart={() => handleAddToCart(product)}
                        />
                      </div>
                    ))}
              </div>

              {products && (
                <div className={"pt-5"}>
                  <PaginationComponent
                    page={productPage}
                    totalPages={products?.totalPages}
                    setPage={setProductPage}
                    backToTop={false}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
