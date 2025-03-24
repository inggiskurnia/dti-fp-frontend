import { toast } from "@/hooks/use-toast";
import { Address } from "@/types/models/checkout/userAddresses";

// Get current user main address
export const getMainAddress = async (
  accessToken?: string
): Promise<Address | null> => {
  if (!accessToken) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/address/main`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      toast({
        title: "Failed to fetch main address",
        description: "Please add main address first",
        variant: "destructive",
        duration: 2000,
      });
      return null;
    }

    const data = await response.json();
    return data.data as Address;
  } catch (error) {
    toast({
      title: "Something went wrong",
      description: `${error}, Please re-login and try again.`,
      variant: "destructive",
      duration: 2000,
    });
    return null;
  }
};

// Get all current user address
export const getAllAddress = async (
  accessToken?: string
): Promise<Address[]> => {
  if (!accessToken) return [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/address`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      toast({
        title: "Failed to fetch address",
        description: "Please login first and try again",
        variant: "destructive",
        duration: 2000,
      });
      return [];
    }

    const data = await response.json();
    return data.data as Address[];
  } catch (error) {
    toast({
      title: "Something went wrong",
      description: `${error}`,
      variant: "destructive",
      duration: 2000,
    });
    return [];
  }
};
