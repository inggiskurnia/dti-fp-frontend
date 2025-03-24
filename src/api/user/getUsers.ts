import { ApiResponse } from "@/types/api/apiResponse";
import { UserAddress } from "@/types/models/users";
import axios from "axios";
import { getSession } from "next-auth/react";

const userAddressUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_USER_ADDRESS}`;

export const getUserAddress = async (): Promise<ApiResponse<UserAddress[]>> => {
  const session = await getSession();
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error("No access token");

  const response = await axios.get<ApiResponse<UserAddress[]>>(userAddressUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
