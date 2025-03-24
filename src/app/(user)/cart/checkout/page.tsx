"use client";

import { createGatewayTransaction } from "@/api/transaction/createGatewayTransaction";
import { createManualTransaction } from "@/api/transaction/createManualTransaction";
import {
  getAllAddress,
  getMainAddress,
} from "@/api/transaction/getUserAddresses";
import CartItemsList from "@/components/checkout/CartItemsList";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import ShippingAddress from "@/components/checkout/ShippingAddress";
import { toast } from "@/hooks/use-toast";
import { CartItem, useCartStore } from "@/store/cartStore";
import { PaymentMethods } from "@/types/models/checkout/paymentMethods";
import { Address } from "@/types/models/checkout/userAddresses";
import { ShippingDetail, ShippingList } from "@/types/models/shippingList";
import { WarehouseDetail } from "@/types/models/warehouses";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

const shipping_cost_url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_SHIPPING_COST}`;
const nearby_url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_WAREHOUSES}/nearby`;
const user_address_id_url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_USER_ADDRESS_ID}`;

const CheckoutPage: FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const cartItems = useCartStore((state) => state.cartItems);
  const setCartItems = useCartStore((state) => state.setCartItems);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethods>("gateway");
  const [userAddress, setUserAddress] = useState<Address[]>([]);
  const [mainAddress, setMainAddress] = useState<Address | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingList, setShippingList] = useState<ShippingList | null>(null);
  const [shippingMethodSelected, setShippingMethodSelected] = useState(false);

  // Load cart data from local storage if there is any data on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart-storage");
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, [setCartItems]);

  // Sync cart data to local storage whenever cartItems change
  useEffect(() => {
    if (cartItems.length > 0)
      localStorage.setItem("cart-storage", JSON.stringify(cartItems));
    else localStorage.removeItem("cart-storage");
  }, [cartItems]);

  // Calculate total price
  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + item.product.price * item.cartQuantity,
        0,
      ),
    [cartItems],
  );

  // Calculate total product weight
  const totalWeight = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + (item.product?.weight ?? 0) * item.cartQuantity,
        0,
      ),
    [cartItems],
  );

  const setShippingMethod = (method: ShippingDetail | null) => {
    if (method) {
      setShippingCost(method.cost);
      setShippingMethodSelected(true);
    } else {
      setShippingMethodSelected(false);
    }
  };

  // Calculate total quantity
  const totalQuantity = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.cartQuantity, 0),
    [cartItems],
  );

  const fetchShippingAddress = useCallback(
    async (address: Address | null) => {
      if (!session || !address) return;

      try {
        const { data: nearby_warehouse_response } = await axios.get(
          `${nearby_url}?longitude=${address.longitude}&latitude=${address.latitude}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );

        const nearby_warehouse =
          nearby_warehouse_response.data as WarehouseDetail[];

        const { data: response } = await axios.post(
          shipping_cost_url,
          {
            warehouseId: nearby_warehouse[0].id,
            userAddressId: address?.id,
            courier: "jne:tiki:wahana:sicepat:anteraja:pos",
            weight: totalWeight * 1000, // gram
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );

        if (response.success) {
          setShippingList(response.data);
        } else {
          toast({
            title: "Failed",
            description: "Failed to get shipping cost",
            variant: "destructive",
            duration: 3000,
          });
        }
      } catch (error) {
        toast({
          title: "Error fetching shipping cost",
          description: `${error}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    },
    [session, totalWeight],
  );

  const fetchUserAddress = useCallback(async () => {
    if (session) {
      const userAddress = await getAllAddress(session.accessToken);
      const mainAddress = await getMainAddress(session.accessToken);
      setUserAddress(userAddress);
      setMainAddress(mainAddress);
      fetchShippingAddress(mainAddress);
    }
  }, [session, fetchShippingAddress]);

  useEffect(() => {
    fetchUserAddress();
  }, [session, fetchUserAddress]);

  const setSelectedAddressAsPrimary = useCallback(
    async (addressId: number) => {
      if (session)
        try {
          const res = await fetch(`${user_address_id_url}/${addressId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
              isPrimary: true,
            }),
          });

          if (res.ok) {
            fetchUserAddress();
          } else {
            toast({
              title: "Failed to set address",
              description: "Failed to set address as Primay, please try again",
              variant: "destructive",
              duration: 3000,
            });
          }
        } catch (err) {
          toast({
            title: "Error setting address as primary",
            description: `${err}`,
            variant: "destructive",
            duration: 3000,
          });
        }
    },
    [session, fetchUserAddress],
  );

  const setSelectedShippingAddress = useCallback(
    (selectedShippingAddress: Address) => {
      if (selectedShippingAddress.primary) return;
      setShippingMethodSelected(false);
      setShippingList(null);
      setSelectedAddressAsPrimary(selectedShippingAddress.id);
    },
    [setSelectedAddressAsPrimary],
  );

  // Tanstack Query mutations transaction
  const gatewayTransaction = useMutation({
    mutationFn: () =>
      createGatewayTransaction({
        accessToken: session?.accessToken,
        latitude: mainAddress?.latitude || 0,
        longitude: mainAddress?.longitude || 0,
        shippingCost: shippingCost,
        paymentMethodId: paymentMethod === "gateway" ? 1 : 2,
        totalPrice: totalPrice,
        cartItems: cartItems as CartItem[],
      }),
  });

  const manualTransaction = useMutation({
    mutationFn: () =>
      createManualTransaction(
        {
          accessToken: session?.accessToken,
          latitude: mainAddress?.latitude || 0,
          longitude: mainAddress?.longitude || 0,
          shippingCost: shippingCost,
          paymentMethodId: paymentMethod === "gateway" ? 1 : 2,
          totalPrice: totalPrice,
          cartItems: cartItems as CartItem[],
        },
        router,
      ),
  });

  return (
    <>
      {/* Midtrans snap pop up  */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <section className="min-h-[calc(100vh-70px)] w-full bg-slate-100 px-6 py-[40px]">
        <div className="mx-auto w-full md:max-w-4xl lg:max-w-[1340px]">
          {/* Breadcrumbs */}
          <div className="flex">
            <h1 className="text-4xl font-medium text-gray-500">
              <Link href="/cart">Cart</Link>
            </h1>
            <span className="mx-2 text-4xl text-gray-500">/</span>
            <h1 className="text-4xl font-semibold">Checkout</h1>
          </div>

          <div className="mt-[40px] flex w-full flex-col-reverse gap-8 lg:flex-row">
            {/* Checkout details & shipping address */}
            <div className="flex w-full flex-col gap-6">
              <ShippingAddress
                userAddress={userAddress}
                setSelectedShippingAddress={setSelectedShippingAddress}
              />
              <CartItemsList cartItems={cartItems} />
            </div>

            {/* Checkout Summary */}
            <div className="relative flex w-full flex-col md:w-[480px] lg:w-[600px]">
              <CheckoutSummary
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                totalQuantity={totalQuantity}
                totalPrice={totalPrice}
                handleCheckout={gatewayTransaction.mutate}
                handleManualCheckout={manualTransaction.mutate}
                isLoading={
                  gatewayTransaction.isPending || manualTransaction.isPending
                }
                isError={
                  gatewayTransaction.isError || manualTransaction.isError
                }
                shippingCost={shippingCost}
                shippingList={shippingList}
                shippingMethodSelected={shippingMethodSelected}
                setShippingMethod={setShippingMethod}
                isDisabled={cartItems.length < 1}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckoutPage;
