import React, { FC, useState } from "react";
import AlertDialogComponent from "@/components/common/AlertDialogComponent";
import { deleteProductCategoryById } from "@/api/product/deleteProducts";
import { ProductCategory } from "@/types/models/products";
import { useProductAdmin } from "@/store/productAdminStore";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import DeleteIcon from "@/components/icon/DeleteIcon";
import { useQuery } from "@tanstack/react-query";
import { getProductMutationHistory } from "@/api/product-mutation/getProductMutation";
import { ProductMutationConstant } from "@/constant/productMutationConstant";
import { useProductMutation } from "@/store/productMutationStore";

const DeleteProductCategoryAlert: FC<ProductCategory> = ({ id, name }) => {
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const { updateProductCategory, setUpdateProductCategory } = useProductAdmin();
  const { data } = useSession();
  const { destinationWarehouseId } = useProductMutation();

  const { data: pendingMutation } = useQuery({
    queryKey: ["pending-mutation", updateProductCategory],
    queryFn: async () =>
      getProductMutationHistory({
        page: 0,
        limit: 1,
        productMutationStatusId: ProductMutationConstant.STATUS_PENDING,
        destinationWarehouseId,
      }),
    enabled: !!data?.accessToken,
  });

  const handleConfirmDelete = () => {
    setUpdateProductCategory(true);

    if (!id || !data?.accessToken) {
      setOpenAlert(false);
      setUpdateProductCategory(false);
      return;
    }

    if (pendingMutation?.content.length !== 0) {
      setOpenAlert(false);
      setUpdateProductCategory(false);
      toast({
        title: "Pending Product Mutation",
        description:
          "Unable to delete, there's still pending product mutation for this product category.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    deleteProductCategoryById({ id, accessToken: data?.accessToken })
      .then(() =>
        toast({
          title: "Success",
          description: "Successfully deleted product category",
          duration: 2000,
        }),
      )
      .catch((err) => {
        toast({
          title: "Error Deleting Product Category",
          description: err.response?.data?.error?.message,
          variant: "destructive",
          duration: 5000,
        });
      })
      .finally(() => {
        setOpenAlert(false);
        setUpdateProductCategory(false);
      });
  };

  return (
    <>
      <DeleteIcon onClick={() => setOpenAlert(true)} />
      <AlertDialogComponent
        open={openAlert}
        setOpen={setOpenAlert}
        title="Are You Sure?"
        description={`All data related to product category ${name} will be deleted from database`}
        onCancel={() => setOpenAlert(false)}
        onConfirm={handleConfirmDelete}
        cancelText="Cancel"
        confirmText="Confirm"
      />
    </>
  );
};

export default DeleteProductCategoryAlert;
