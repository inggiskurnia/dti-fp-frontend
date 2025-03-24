import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useProductAdmin } from "@/store/productAdminStore";
import { createProductCategory } from "@/api/product/createProduct";
import { toast } from "@/hooks/use-toast";

const AddProductCategory = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [productCategoryName, setProductCategoryName] = useState<string>();
  const { data } = useSession();
  const { updateProductCategory, setUpdateProductCategory } = useProductAdmin();

  const handleDialog = () => {
    setDialogOpen(!dialogOpen);
  };

  const handleOnSubmit = () => {
    setUpdateProductCategory(true);
    if (!productCategoryName || !data?.accessToken) return;

    createProductCategory({
      name: productCategoryName,
      accessToken: data?.accessToken,
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
        setUpdateProductCategory(false);
      });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="h-full" onClick={handleDialog}>
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] rounded-lg p-4 sm:max-w-[500px] sm:p-6">
        <DialogHeader className="mb-5">
          <DialogTitle>Product Category</DialogTitle>
          <DialogDescription>Add new product category</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Name
          </Label>
          <Input
            className="col-span-3 resize-none"
            onChange={(e) => setProductCategoryName(e.target.value)}
            required
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

export default AddProductCategory;
