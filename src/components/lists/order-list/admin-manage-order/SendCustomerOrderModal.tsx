"use client";

import { SendCustomerOrder } from "@/api/transaction/admin/sendCustomerOrder";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { OrderItems } from "@/types/models/orders/orders";
import { formatPrice } from "@/utils/formatter";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Truck } from "lucide-react";
import Image from "next/image";
import React, { FC, useState } from "react";

type SendCustomerOrderModalProps = {
  accessToken: string | undefined;
  orderId: number;
  orderStatusId: number;
  orderItems: OrderItems[];
  // paymentMethodId: number;
};

const SendCustomerOrderModal: FC<SendCustomerOrderModalProps> = ({
  accessToken,
  orderId,
  orderStatusId,
  orderItems,
  // paymentMethodId,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isAdminApproved, setIsAdminApproved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendCustomerOrder = useMutation({
    mutationFn: () => SendCustomerOrder(orderId, accessToken, isAdminApproved),
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
          disabled={orderStatusId !== 3}
          onClick={() => setIsOpen(true)}
        >
          <Truck size={26} />
          Send customer order
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:min-w-[360px] md:min-w-[600px]">
        <DialogHeader className="flex w-full flex-col gap-2">
          <DialogTitle className="m-0 flex items-center gap-2 p-0 text-3xl font-semibold text-green-800">
            <Truck className="mr-2 h-6 w-6 text-green-800" />
            Send order items ?
          </DialogTitle>
          <Separator />
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Order items */}
          <div className="flex flex-col">
            <h3 className="mb-3 text-2xl font-bold">Order Items</h3>
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-gray-100 py-4"
              >
                <Image
                  src="/images/no-image-icon.jpg"
                  alt="Product image"
                  width={60}
                  height={60}
                  className="h-[60px] w-[60px] object-cover"
                />
                <div className="flex flex-col">
                  <span className="line-clamp-3 max-w-[700px] text-[16px] font-bold">
                    {item.productName}
                  </span>
                  <span className="text-[15px] text-gray-500">
                    {item.quantity} x {formatPrice(String(item.unitPrice))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <p className="py-4 text-[16px] font-medium text-black">
            This action cannot be undone. Please make sure you already check the
            order payment proof image for this order and ready to send order
            items.
          </p>
        </div>
        {/* Checkbox Confirmation */}
        <div className="mt-2 flex items-center gap-2">
          <Checkbox
            id="confirm"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked as boolean)}
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
          {/* Send customer order */}
          <Button
            variant="green"
            disabled={!isChecked || handleSendCustomerOrder.isPending}
            className="px-6"
            onClick={() => {
              setIsAdminApproved(true);
              handleSendCustomerOrder.mutate();
            }}
          >
            {handleSendCustomerOrder.isPending ? (
              <div className="flex items-center gap-4">
                <Loader2 size={36} className="animate-spin" />
                Sending...
              </div>
            ) : (
              "Send customer order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendCustomerOrderModal;
