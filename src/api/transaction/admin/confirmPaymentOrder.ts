import { toast } from "@/hooks/use-toast";
import axios from "axios";

export const ConfirmPaymentOrder = async (
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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/orders/${orderId}/approve-payment`,
      { isAdminApproved: isAdminApproved },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    toast({
      title: "Order payment accepted",
      description: "Successfully verify and approve manual payment.",
      duration: 2000,
    });

    return response.data;
  } catch (error) {
    toast({
      title: "Verify and approve manual payment failed",
      description: `Failed to verify and approve, ${error}`,
      variant: "destructive",
      duration: 3000,
    });
  }
};
