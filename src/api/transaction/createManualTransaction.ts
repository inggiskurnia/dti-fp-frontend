import { toast } from "@/hooks/use-toast";
import { CartItem, useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

type ManualTransferPayload = {
  accessToken: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  paymentMethodId: number;
  shippingCost: number;
  totalPrice: number;
  cartItems: CartItem[];
};

// Handle manual transfer payment
export const createManualTransaction = async (
  {
    accessToken,
    latitude,
    longitude,
    shippingCost,
    paymentMethodId,
    totalPrice,
    cartItems,
  }: ManualTransferPayload,
  router: ReturnType<typeof useRouter>,
) => {
  try {
    if (!accessToken) {
      toast({
        title: "Authentication Error",
        description:
          "You need to be logged in to proceed with the transaction.",
        variant: "destructive",
      });
      return;
    }

    // Set order items
    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.cartQuantity,
      unitPrice: item.product.price,
    }));

    const payload = {
      latitude: latitude,
      longitude: longitude,
      paymentMethodId: paymentMethodId,
      orderStatusId: 1, // Default status for waiting payment
      shippingCost: shippingCost,
      grossAmount: totalPrice + shippingCost,
      orderItems: orderItems,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/transactions/create-manual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      toast({
        title: "Failed to create transaction",
        description: "Please make sure you're verified and try again.",
        variant: "destructive",
      });
      return;
    }

    const data = await response.json();
    const orderId = data.data.transactionId;

    // Reset cart items
    useCartStore.getState().resetCart();

    toast({
      title: "Your order have been set.",
      description: "Please follow the instructions to complete your payment.",
      duration: 3000,
    });

    router.push(`/cart/checkout/manual-payment/${orderId}`);
  } catch (error) {
    toast({
      title: "Payment Error",
      description: `${error} Something went wrong. Please try again.`,
      variant: "destructive",
      duration: 2000,
    });
  }
};
