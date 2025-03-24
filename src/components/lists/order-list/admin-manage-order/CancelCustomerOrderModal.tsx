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
import { cancelOrder } from "@/api/transaction/cancelOrder";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, TriangleAlert } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { Checkbox } from "@/components/ui/checkbox";

type CancelCustomerOrderModalProps = {
  orderId: number;
  orderStatusId: number;
};

const CancelCustomerOrderModal: FC<CancelCustomerOrderModalProps> = ({
  orderId,
  orderStatusId,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCancleCustomerOrder = useMutation({
    mutationFn: () => cancelOrder(orderId),
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
          variant={"outline"}
          className="text-md border-red-500 font-semibold text-red-500"
          disabled={
            Number(orderStatusId) === 4 ||
            Number(orderStatusId) === 5 ||
            Number(orderStatusId) === 6
          }
          onClick={() => setIsOpen(true)}
        >
          Cancel Order
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:min-w-[400px] md:min-w-[600px]">
        <DialogHeader className="flex w-full flex-col gap-2">
          <DialogTitle className="m-0 flex items-center gap-2 p-0 text-3xl font-semibold text-red-700">
            <TriangleAlert className="mr-2 h-6 w-6 text-red-500" />
            Cancel this customer order ?
          </DialogTitle>
          <Separator />
        </DialogHeader>
        <>
          <p className="py-4 text-[16px] font-medium text-black">
            This action cannot be undone. Please make sure you already receive
            the order and you are ready to cancel this order.
          </p>
        </>
        {/* Checkbox Confirmation */}
        <div className="mt-2 flex items-center gap-2">
          <Checkbox
            id="confirm"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked as boolean)}
          />
          <label htmlFor="confirm" className="text-sm text-gray-600">
            I understand that this order is final and cannot be undone.
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
          <Button
            variant="destructive"
            disabled={!isChecked || handleCancleCustomerOrder.isPending}
            className="px-6"
            onClick={() => handleCancleCustomerOrder.mutate()}
          >
            {handleCancleCustomerOrder.isPending ? (
              <div className="flex items-center gap-4">
                <Loader2 size={36} className="animate-spin" />
                <span>Cancelling...</span>
              </div>
            ) : (
              <span>Cancel this order</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelCustomerOrderModal;
