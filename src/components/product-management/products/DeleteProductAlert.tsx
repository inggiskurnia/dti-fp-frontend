import React, { FC, useState } from "react";
import DeleteIcon from "@/components/icon/DeleteIcon";
import AlertDialogComponent from "@/components/common/AlertDialogComponent";
import { useProductAdmin } from "@/store/productAdminStore";
import { useSession } from "next-auth/react";
import { useProductMutation } from "@/store/productMutationStore";
import { useQuery } from "@tanstack/react-query";
import { getProductMutationHistory } from "@/api/product-mutation/getProductMutation";
import { ProductMutationConstant } from "@/constant/productMutationConstant";
import { toast } from "@/hooks/use-toast";
import { deleteProductById } from "@/api/product/deleteProducts";

interface DeleteProductAlertProps {
  id: number;
  name: string;
}

const DeleteProductAlert: FC<DeleteProductAlertProps> = ({ id, name }) => {
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const { updateProduct, setUpdateProduct } = useProductAdmin();
  const { data } = useSession();
  const { destinationWarehouseId } = useProductMutation();

  const { data: pendingMutation } = useQuery({
    queryKey: ["pending-mutation", updateProduct],
    queryFn: async () =>
      getProductMutationHistory({
        page: 0,
        limit: 1,
        productMutationStatusId: ProductMutationConstant.STATUS_PENDING,
        destinationWarehouseId,
      }),
  });

  const handleConfirmDelete = () => {
    setUpdateProduct(true);

    if (!id || !data?.accessToken) {
      setOpenAlert(false);
      setUpdateProduct(false);
      return;
    }

    if (pendingMutation?.content.length !== 0) {
      setOpenAlert(false);
      setUpdateProduct(false);
      toast({
        title: "Pending Product Mutation",
        description:
          "Unable to delete, there's still pending product mutation for this product.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    deleteProductById({ id, accessToken: data?.accessToken })
      .then(() =>
        toast({
          title: "Success",
          description: "Successfully deleted product",
          duration: 2000,
        }),
      )
      .catch((err) => {
        toast({
          title: "Error Deleting Product",
          description: err.response?.data?.error?.message,
          variant: "destructive",
          duration: 5000,
        });
      })
      .finally(() => {
        setOpenAlert(false);
        setUpdateProduct(false);
      });
  };
  return (
    <>
      <DeleteIcon onClick={() => setOpenAlert(true)} />
      <AlertDialogComponent
        open={openAlert}
        setOpen={setOpenAlert}
        title="Are You Sure?"
        description={`All data related to product ${name} will be deleted from database`}
        onCancel={() => setOpenAlert(false)}
        onConfirm={handleConfirmDelete}
        cancelText="Cancel"
        confirmText="Confirm"
      />
    </>
  );
};

export default DeleteProductAlert;
