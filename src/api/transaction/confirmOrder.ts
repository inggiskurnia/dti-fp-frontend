import { toast } from "@/hooks/use-toast";
import axios from "axios";

export const confirmOrder = async (
  orderId: number,
  accessToken: string | undefined
) => {
  if (!accessToken) {
    toast({
      title: "Unauthorized",
      description: `No access token provided.`,
      variant: "destructive",
      duration: 3000,
    });
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders/customer/${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    toast({
      title: "Order items received",
      description: "Successfully confirm the order already reveiced.",
      duration: 2000,
    });

    return response.data;
  } catch (error) {
    toast({
      title: "Confirm order failed",
      description: `Failed to confirm the order, ${error}`,
      variant: "destructive",
      duration: 3000,
    });
  }
};
