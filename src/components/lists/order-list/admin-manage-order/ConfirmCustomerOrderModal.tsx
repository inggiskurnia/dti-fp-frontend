"use client";

import React, { FC, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { ConfirmPaymentOrder } from "@/api/transaction/admin/confirmPaymentOrder";
import { Loader2, VerifiedIcon } from "lucide-react";
import Image from "next/image";

type ConfirmCustomerOrderModalProps = {
  orderStatusId: number;
  orderId: number;
  paymentProofImage: string;
  paymentMethodId: number;
  accessToken: string | undefined;
};

const ConfirmCustomerOrderModal: FC<ConfirmCustomerOrderModalProps> = ({
  accessToken,
  orderId,
  paymentProofImage,
  paymentMethodId,
  orderStatusId,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminApproved, setIsAdminApproved] = useState(false);

  const handleConfirmCustomerOrder = useMutation({
    mutationFn: () =>
      ConfirmPaymentOrder(orderId, accessToken, isAdminApproved),
    onSuccess: () => {
      setIsOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"green"}
          className="text-md font-semibold"
          disabled={orderStatusId !== 2}
          onClick={() => setIsOpen(true)}
        >
          <VerifiedIcon size={26} />
          Verify & Confirm Order Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full p-6 md:min-w-[700px]">
        <DialogHeader className="flex w-full flex-col gap-2">
          <DialogTitle className="m-0 flex items-center gap-2 p-0 text-2xl font-semibold text-green-800 md:text-3xl">
            <VerifiedIcon className="mr-2 h-6 w-6 text-green-800" />
            Confirm order payment ?
          </DialogTitle>
          <Separator />
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {paymentMethodId === 2 && paymentProofImage !== null ? (
            <div className="flex w-full flex-col gap-4 md:items-center md:justify-center">
              <h3 className="mb-3 text-2xl font-bold">Image Proof</h3>
              <Image
                src={paymentProofImage || "/images/dummy-hero-img.png"}
                alt={"Payment proof img"}
                width={400}
                height={400}
                className="h-[320px] w-[320px] object-contain md:h-[400px] md:w-[400px]"
              />
            </div>
          ) : (
            paymentMethodId === 2 &&
            paymentProofImage !== null && (
              <p className="text-md text-gray-600">
                No payment image proof uploaded yet.
              </p>
            )
          )}
          <p className="py-4 text-[16px] font-medium text-black">
            This action cannot be undone. Please make sure you already check the
            order payment proof image for this order.
          </p>
        </div>
        {/* Checkbox Confirmation */}
        <div className="mt-2 flex items-center gap-2">
          <Checkbox
            id="confirm"
            checked={isChecked}
            onCheckedChange={(checked) => {
              setIsChecked(checked as boolean);
            }}
          />
          <label htmlFor="confirm" className="text-sm text-gray-600">
            I already check the order payment proof image and understand that
            this order is final and cannot be undone.
          </label>
        </div>

        <Separator className="mt-4" />

        <DialogFooter className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="mr-2"
              onClick={() => {
                setIsChecked(false);
                setIsOpen(false);
              }}
            >
              close
            </Button>
          </DialogClose>
          {/* Reject order payment proof  */}
          <Button
            variant="destructive"
            disabled={!isChecked || handleConfirmCustomerOrder.isPending}
            className="px-6"
            onClick={() => {
              setIsAdminApproved(false);
              handleConfirmCustomerOrder.mutate();
            }}
          >
            {handleConfirmCustomerOrder.isPending ? (
              <div className="flex items-center gap-4">
                <Loader2 size={36} className="animate-spin" />
                Rejecting...
              </div>
            ) : (
              "Reject payment proof"
            )}
          </Button>
          {/* Accept payment proof */}
          <Button
            variant="green"
            disabled={!isChecked || handleConfirmCustomerOrder.isPending}
            className="px-6"
            onClick={() => {
              setIsAdminApproved(true);
              handleConfirmCustomerOrder.mutate();
            }}
          >
            {handleConfirmCustomerOrder.isPending ? (
              <div className="flex items-center gap-4">
                <Loader2 size={36} className="animate-spin" />
                Confirming...
              </div>
            ) : (
              "Confirm payment order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmCustomerOrderModal;
