"use client";

import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { addOneHour } from "@/utils/time";
import { useSession } from "next-auth/react";
import { QRCodeCanvas } from "qrcode.react";
import { fetchOrderDetail } from "@/components/lists/order-list/OrderDetailsModal";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { ImagePlus, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatDateTime, formatPrice } from "@/utils/formatter";
import { uploadImageManualTransaction } from "@/api/transaction/uploadImageManualTransaction";
import Image from "next/image";

const ManualPatmentPage = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orderDetails", orderId, accessToken],
    queryFn: () => fetchOrderDetail(Number(orderId), accessToken!),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 60, // Set stale time to 60 minutes
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
    refetchInterval: false, // Disable automatic refetching
  });

  const createdAt = data?.data.createdAt ?? "";
  const { timeLeft, formattedTime } = useCountdownTimer(createdAt.toString());

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
        <p className="text-lg font-semibold text-red-500">
          Failed to load order details. Please try again.
        </p>
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 1 * 1024 * 1024; // 1MB

      // Validate file type
      if (!validExtensions.includes(file.type)) {
        toast({
          title: "Error uploading image",
          description:
            "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast({
          title: "Error uploading image",
          description: "File size exceeds 1MB. Please upload a smaller file.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPaymentImage = async () => {
    if (!selectedFile) {
      toast({
        title: "No image found",
        description: "Please select an image first",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      await uploadImageManualTransaction({
        orderId: Number(orderId),
        selectedFile,
        accessToken: accessToken!,
      });

      router.refresh();
      window.location.reload();
    } catch (error) {
      toast({
        title: "Failed to upload payment proof image",
        description: `Error ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-70px)] w-full bg-white px-6 py-[40px]">
      {isLoading ? (
        <div className="flex min-h-[calc(100vh-160px)] w-full flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-lg font-semibold">Loading payment details...</p>
        </div>
      ) : (
        <div className="mx-auto flex w-full flex-col items-center gap-14 md:max-w-4xl lg:max-w-[1340px]">
          {/* Payment time details */}
          <div className="flex w-full flex-col items-center gap-4 md:w-[660px]">
            <h2 className="text-center text-2xl font-bold">
              Complete the payment within
            </h2>
            {data?.data.orderStatusId === 2 ? (
              <span className="text-3xl font-bold text-green-600">
                Upload success
              </span>
            ) : data?.data.orderStatusId === 6 ? (
              <span className="text-3xl font-bold text-red-500">
                Order canceled
              </span>
            ) : (
              <>
                <span className="text-3xl font-bold text-green-600">
                  {formattedTime}
                </span>
                <p className="text-base text-gray-500">Before</p>
                <span className="text-xl font-bold">
                  {
                    formatDateTime(addOneHour(createdAt.toString()))
                      .formattedDateTime
                  }
                </span>
              </>
            )}

            {/* Payment details */}
            <div className="mt-6 flex w-full flex-col rounded-xl border p-6">
              <div className="flex flex-col items-center justify-between md:flex-row">
                <span>Total payment</span>
                <span className="text-lg font-bold">
                  {formatPrice(String(data?.data.totalAmount))}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="flex flex-col items-center justify-between md:flex-row">
                <span>Invoice code</span>
                <span className="text-lg font-bold">
                  {data?.data.invoiceCode}
                </span>
              </div>
            </div>
          </div>
          {data?.data.orderStatusId === 2 ? (
            <div className="mt-2 flex h-full w-full items-center justify-center">
              <Image
                src={data?.data.paymentProofImageUrl}
                alt="Payment proof image"
                height={660}
                width={660}
                className="rounded-lg object-cover md:h-[660px] md:w-[660px]"
              />
            </div>
          ) : data?.data.orderStatusId === 6 || timeLeft <= 0 ? (
            <div className="flex h-[200px] w-[660px] items-center justify-center rounded-xl border text-base font-semibold text-red-500">
              <span>Order canceled, payment already expired.</span>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-9 md:flex-row">
              {timeLeft > 0 && (
                <>
                  {/* QR code section */}
                  <div className="flex flex-col items-center justify-center gap-6 border p-4">
                    <QRCodeCanvas
                      value={data?.data.invoiceCode ?? "dummy-qr-code"}
                      size={200}
                    />
                    <p className="mt-2 text-center text-gray-600">
                      Scan QR Code to pay the order
                    </p>
                  </div>
                  <div className="h-full border border-gray-200" />
                  {/* File upload section */}
                  <div className="flex flex-col items-center gap-6">
                    <label
                      htmlFor="file-upload"
                      className="relative flex h-[300px] w-[300px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:bg-gray-100"
                    >
                      {previewUrl ? (
                        <div className="mt-2 flex h-full w-full items-center justify-center bg-slate-100">
                          <Image
                            src={previewUrl}
                            alt="Payment proof image"
                            height={300}
                            width={300}
                            className="h-[300px] w-[300px] rounded-lg object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3">
                          <ImagePlus className="text-gray-400" size={28} />
                          <p className="text-center text-gray-500">
                            Click to upload image
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex w-full flex-col gap-6 md:max-w-[660px] md:flex-row">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                router.push("/order-list");
              }}
            >
              See payment status
            </Button>
            {timeLeft > 0 && data?.data.orderStatusId === 1 && (
              <Button
                type="submit"
                variant="green"
                disabled={loading || timeLeft < 0}
                className="w-full px-6"
                onClick={handleUploadPaymentImage}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Uploading...
                  </div>
                ) : (
                  "Upload image"
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ManualPatmentPage;
