import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getDetailProductMutationById } from "@/api/product-mutation/getProductMutation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import StatusComponent from "@/components/common/StatusComponent";

interface ProductMutationDetailDialogProps {
  id: number;
}

const ProductMutationDetailDialog: FC<ProductMutationDetailDialogProps> = ({
  id,
}) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { data, isLoading } = useQuery({
    queryKey: ["product-mutation-detail", id, dialogOpen],
    queryFn: () => getDetailProductMutationById(id),
    enabled: dialogOpen,
  });

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not yet reviewed";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button
          className={"text-sm font-semibold text-gray-600 hover:bg-slate-50"}
        >
          See Details
        </button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] rounded-lg p-4 sm:max-w-[600px] sm:p-6">
        <DialogHeader className="mb-5">
          <DialogTitle>Product Mutation Details</DialogTitle>
          <DialogDescription>
            {data?.productMutationCode && (
              <span>
                Mutation Code: {data?.productMutationCode || "Loading..."}
              </span>
            )}
            {data?.invoiceCode && (
              <span>Invoice Code: {data?.invoiceCode || "Loading..."} </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  Mutation #{data.productMutationId}
                </h3>
              </div>
              <StatusComponent name={data?.productMutationStatusName} />
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Product Information</p>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm">Product Name:</p>
                      <p className="text-sm font-medium">{data.productName}</p>
                      <p className="text-sm">Product Category:</p>
                      <p className="text-sm">{data.productCategoryName}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mutation Details</p>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm">Mutation Type:</p>
                      <p className="text-sm">{data.productMutationTypeName}</p>
                      <p className="text-sm">Quantity:</p>
                      <p className="text-sm font-semibold">{data.quantity}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Warehouse Information</p>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm">Origin Warehouse:</p>
                      <p className="text-sm">{data.originWarehouseName}</p>
                      <p className="text-sm">Destination Warehouse:</p>
                      <p className="text-sm">{data.destinationWarehouseName}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Requester Information</p>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm">Requester Name:</p>
                      <p className="text-sm">{data.requesterName}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">Notes:</p>
                      <p className="mt-1 rounded bg-muted p-2 text-sm">
                        {data.requesterNotes || "No notes"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Review Information</p>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm">Reviewer Name:</p>
                      <p className="text-sm">
                        {data.reviewerName || "Not yet reviewed"}
                      </p>
                      <p className="text-sm">Reviewed At:</p>
                      <p className="text-sm">
                        {formatDateTime(data.reviewedAt)}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">Notes:</p>
                      <p className="mt-1 rounded bg-muted p-2 text-sm">
                        {data.reviewerNotes || "No review notes"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductMutationDetailDialog;
