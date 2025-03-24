import { toast } from "@/hooks/use-toast";
import { CartItem, useCartStore } from "@/store/cartStore";

type GatewayTransferPayload = {
  accessToken: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  paymentMethodId: number;
  shippingCost: number;
  totalPrice: number;
  cartItems: CartItem[];
};

// Handle payment gateway checkout
export const createGatewayTransaction = async ({
  accessToken,
  latitude,
  longitude,
  paymentMethodId,
  shippingCost,
  totalPrice,
  cartItems,
}: GatewayTransferPayload) => {
  try {
    if (!accessToken) {
      toast({
        title: "Authentication Error",
        description: "Please log in to proceed.",
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

    // Set payload
    const payload = {
      grossAmount: totalPrice + shippingCost,
      latitude: latitude,
      longitude: longitude,
      paymentMethodId: paymentMethodId,
      shippingCost: shippingCost,
      orderStatusId: 1, // Default status for waiting payment
      orderItems: orderItems,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/transactions/create-gateway`,
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
    }

    const data = await response.json();

    // Reset cart items
    useCartStore.getState().resetCart();

    toast({
      title: "Your order have been set.",
      description: "Please complete the order payment.",
      duration: 3000,
    });

    await window.snap.pay(data.data.token);
  } catch (error) {
    toast({
      title: "Payment failed",
      duration: 2000,
      variant: "destructive",
      description: `${error} Please check your order and payment detail.`,
    });
  }
};
