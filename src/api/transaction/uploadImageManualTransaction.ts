import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { postFileBuilderIo } from "../builder-io/postBuilderIo";

interface UploadImageManualTransactionProps {
  orderId: number;
  selectedFile: File;
  accessToken: string;
}

export const uploadImageManualTransaction = async ({
  orderId,
  selectedFile,
  accessToken,
}: UploadImageManualTransactionProps) => {
  if (!selectedFile) {
    throw new Error("No image found. Please select an image first.");
  }

  try {
    // Upload the selected file
    const response = await postFileBuilderIo({
      name: selectedFile.name,
      altText: selectedFile.name,
      folder: process.env.NEXT_PUBLIC_BUILDER_IO_PAYMENT_PROOF_FOLDER_ID,
      file: selectedFile,
    });

    // Send the image URL to update payment proof image
    const backendResponse = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/transactions/payment-proof/${orderId}`,
      {
        paymentProofImage: response.url,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    toast({
      title: "Success",
      description: "Payment proof uploaded successfully",
      duration: 2000,
    });

    return backendResponse.data;
  } catch (error) {
    toast({
      title: "Upload failed",
      description: `Failed to upload payment proof. Please try again. ${error}`,
      variant: "destructive",
      duration: 3000,
    });
  }
};
