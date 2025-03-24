import { toast } from "@/hooks/use-toast";
import axios from "axios";

export const cancelOrder = async (
  orderId: number,
  // accessToken: string | undefined
) => {
  // if (!accessToken) {
  //   toast({
  //     title: "Unauthorized",
  //     description: `No access token provided.`,
  //     variant: "destructive",
  //     duration: 3000,
  //   });
  //   return;
  // }

  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders/customer/cancel/${orderId}`,
      // {},
      // {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // }
    );

    toast({
      title: "Cancel order",
      description: "Successfully cancel the order.",
      duration: 2000,
    });

    return response.data;
  } catch (error) {
    toast({
      title: "Cancel order failed",
      description: `Failed to cancel the order, ${error}`,
      variant: "destructive",
      duration: 3000,
    });
  }
};
