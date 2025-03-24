"use client";

import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import ProductSelection from "../product-management/products/ProductSelection";
import QuantityChange from "../common/QuantityChange";
import { useSession } from "next-auth/react";
import { Checkbox } from "../ui/checkbox";
import { ProductMutationRequest } from "@/types/models/productMutation";
import { updateQuantityWarehouseInventoryById } from "@/api/warehouse-inventories/putWarehouseInventoris";
import { useProductMutation } from "@/store/productMutationStore";
import { toast } from "@/hooks/use-toast";
import { createProductMutationManual } from "@/api/product-mutation/postProductMutation";
import AvailableWarehouseSelection from "../warehouse/AvailableWarehouseSelection";
import { cn } from "@/lib/utils";
import EditIcon from "@/components/icon/EditIcon";

interface ProductMutationProps {
  isProductMutation?: boolean;
  buttonName: string;
  buttonClassName?: string;
  onClick?: () => void;
}

const MutationDialog: FC<ProductMutationProps> = ({
  isProductMutation,
  buttonName,
  buttonClassName,
  onClick,
}) => {
  const { data } = useSession();
  const requesterId = data?.userDetail?.id;
  const [isMutation, setIsMutation] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [ItemQuantity, setItemQuantity] = useState<number>(0);
  const [requesterNotes, setRequesterNotes] = useState<string>();
  const [submitIsLoading, setSubmitIsLoading] = useState<boolean>(false);
  const {
    warehouseInventoryId,
    productId,
    originWarehouseId,
    originWarehouseQuantity,
    destinationWarehouseId,
    setProductId,
    setOriginWarehouseId,
    setSubmitMutation,
    setOriginWarehouseQuantity,
  } = useProductMutation();

  useEffect(() => {
    setItemQuantity(0);
  }, [isMutation]);

  const handleProductMutationQuantity = (
    newMutation: ProductMutationRequest,
  ) => {
    if (!warehouseInventoryId) return;
    setSubmitIsLoading(true);
    updateQuantityWarehouseInventoryById(warehouseInventoryId, newMutation)
      .then(() => {
        setSubmitMutation(true);
        toast({
          title: `Update Product Quantity`,
          description: `Successfully update ${ItemQuantity} quantity`,
          duration: 5000,
        });
      })
      .catch((error) => {
        toast({
          title: "Error creating product category",
          description: error.response.data.message,
          variant: "destructive",
          duration: 5000,
        });
      })
      .finally(() => {
        setDialogOpen(false);
        setSubmitMutation(false);
        setSubmitIsLoading(false);
      });
  };

  const handleProductMutationManual = (newMutation: ProductMutationRequest) => {
    setSubmitIsLoading(true);
    createProductMutationManual(newMutation)
      .then(() => {
        setSubmitMutation(true);
        toast({
          title: "Manual Product Mutation",
          description: "Successfully create new request",
          duration: 5000,
        });
      })
      .catch((error) => {
        toast({
          title: "Error creating product category",
          description: error.response.data.message,
          variant: "destructive",
          duration: 5000,
        });
      })
      .finally(() => {
        setDialogOpen(false);
        setSubmitMutation(false);
        setSubmitIsLoading(false);
      });
  };

  const handleOnSubmit = () => {
    if (!productId || !ItemQuantity || !requesterId || !destinationWarehouseId)
      return;

    const newProductMutation: ProductMutationRequest = {
      productId: productId,
      quantity: ItemQuantity,
      requesterNotes: requesterNotes,
      requesterId: requesterId,
      originWarehouseId: originWarehouseId,
      destinationWarehouseId: destinationWarehouseId,
    };

    if (isMutation) {
      handleProductMutationManual(newProductMutation);
    } else {
      handleProductMutationQuantity(newProductMutation);
    }
  };

  const handleOpenChange = () => {
    setDialogOpen(true);
    setIsMutation(false);
    setItemQuantity(0);
    setRequesterNotes(undefined);
    setProductId(undefined);
    setOriginWarehouseId(undefined);
    setOriginWarehouseQuantity(undefined);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {isProductMutation ? (
          <Button
            variant="outline"
            onClick={() => {
              handleOpenChange();
              setIsMutation(isProductMutation);
              if (onClick) onClick();
            }}
            className={cn(buttonClassName, "h-full w-full")}
            disabled={!destinationWarehouseId}
          >
            {buttonName}
          </Button>
        ) : (
          <EditIcon
            onClick={() => {
              handleOpenChange();
              if (onClick) onClick();
            }}
          />
        )}
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] rounded-lg p-4 sm:max-w-[500px] sm:p-6">
        <DialogHeader className="mb-5">
          <DialogTitle>Inventory Quantity</DialogTitle>
          <DialogDescription>
            Increase or decrease the quantity
          </DialogDescription>
        </DialogHeader>

        <div className="item-center mb-4 flex justify-center gap-2">
          <label
            htmlFor="productMutation"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Product Mutation
          </label>
          <Checkbox
            id="productMutation"
            checked={isMutation}
            onClick={() => setIsMutation(!isMutation)}
          />
        </div>

        {isMutation && (
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="grid-cols-1 text-right">
                Product
              </Label>
              <div className="col-span-3">
                <ProductSelection
                  filter="include"
                  productId={productId}
                  setProductId={setProductId}
                  showIcon={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="grid-cols-1 text-right">
                Request from
              </Label>
              <div className="col-span-3">
                <AvailableWarehouseSelection />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="grid-cols-1 text-right">
            Quantity
          </Label>
          <div className="col-span-3">
            <QuantityChange
              itemQuantity={ItemQuantity}
              lowerLimit={isMutation ? 0 : undefined}
              setItemQuantity={setItemQuantity}
              higherLimit={isMutation ? originWarehouseQuantity : undefined}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Notes
          </Label>
          <Textarea
            placeholder="Type your notes here"
            className="col-span-3 resize-none"
            onChange={(e) => setRequesterNotes(e.target.value)}
            required
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleOnSubmit}
            disabled={
              !destinationWarehouseId ||
              !productId ||
              ItemQuantity === 0 ||
              (isMutation && !originWarehouseId) ||
              submitIsLoading
            }
          >
            {submitIsLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MutationDialog;
