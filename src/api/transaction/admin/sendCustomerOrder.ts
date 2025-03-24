import { toast } from "@/hooks/use-toast";
import axios from "axios";

export const SendCustomerOrder = async (
  orderId: number,
  accessToken: string | undefined,
  isAdminApproved: boolean,
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
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/orders/${orderId}/send-order`,
      { isAdminApproved: isAdminApproved },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    toast({
      title: "Send customer order success",
      description: "Successfully send customer order items.",
      duration: 2000,
    });

    return response.data;
  } catch (error) {
    toast({
      title: "Send customer order failed",
      description: `Failed to send customer order items, ${error}`,
      variant: "destructive",
      duration: 3000,
    });
  }
};
