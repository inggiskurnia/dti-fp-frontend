import React, { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { ProductCategory } from "@/types/models/products";
import { updateProductCategoryById } from "@/api/product/putProducts";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { useProductAdmin } from "@/store/productAdminStore";
import EditIcon from "@/components/icon/EditIcon";
import { toast } from "@/hooks/use-toast";

const EditProductCategoryDialog: FC<ProductCategory> = ({ id, name }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [productCategoryName, setProductCategoryName] = useState<string>();
  const { data } = useSession();
  const { updateProductCategory, setUpdateProductCategory } = useProductAdmin();

  useEffect(() => {
    setProductCategoryName(name);
  }, [name]);

  const handleDialog = () => {
    setDialogOpen(!dialogOpen);
  };

  const handleOnSubmit = () => {
    setUpdateProductCategory(true);
    if (!productCategoryName || !data?.accessToken) return;

    updateProductCategoryById({
      id,
      name: productCategoryName,
      accessToken: data?.accessToken,
    })
      .catch((e) => {
        toast({
          title: "Error Updating Product Category",
          description: e.response.data.message,
          duration: 5000,
        });
      })
      .finally(() => {
        setDialogOpen(false);
        setUpdateProductCategory(false);
      });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <EditIcon onClick={handleDialog} />
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] rounded-lg p-4 sm:max-w-[500px] sm:p-6">
        <DialogHeader className="mb-5">
          <DialogTitle>Product Category</DialogTitle>
          <DialogDescription>
            Edit name for this product category
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Name
          </Label>
          <Input
            className="col-span-3 resize-none"
            onChange={(e) => setProductCategoryName(e.target.value)}
            required
            value={productCategoryName}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleOnSubmit}
            disabled={!productCategoryName || updateProductCategory}
          >
            {updateProductCategory ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductCategoryDialog;
