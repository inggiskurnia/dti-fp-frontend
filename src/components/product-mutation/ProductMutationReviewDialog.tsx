"use client";

import { FC, useState } from "react";
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
import { Label } from "@radix-ui/react-label";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  approveManualProductMutation,
  declineManualProductMutation,
} from "@/api/product-mutation/putProductMutation";
import { useProductMutation } from "@/store/productMutationStore";

interface ProductMutationReviewDialogProps {
  isApprove: boolean;
  productMutationId: number;
}

const ProductMutationReviewDialog: FC<ProductMutationReviewDialogProps> = ({
  isApprove,
  productMutationId,
}) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [reviewerNotes, setReviewerNotes] = useState<string>();
  const { data } = useSession();
  const reviewerId = data?.userDetail?.id;
  const { submitMutation, setSubmitMutation } = useProductMutation();

  const handleOnSubmit = () => {
    if (!reviewerId) return;
    if (isApprove) {
      setSubmitMutation(true);
      approveManualProductMutation({
        userId: reviewerId,
        notes: reviewerNotes,
        productMutationId,
      })
        .then(() => {
          setDialogOpen(false);
          setSubmitMutation(false);
        })
        .finally(() => {
          setDialogOpen(false);
          setSubmitMutation(false);
        });
    } else {
      setSubmitMutation(true);
      declineManualProductMutation({
        userId: reviewerId,
        notes: reviewerNotes,
        productMutationId,
      })
        .then(() => {
          setDialogOpen(false);
          setSubmitMutation(false);
        })
        .finally(() => {
          setDialogOpen(false);
          setSubmitMutation(false);
        });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            isApprove
              ? "bg-warehub-green text-white hover:bg-warehub-green-light"
              : "bg-whitetext-slate-700 border-slate-300 text-black hover:bg-slate-50",
            "h-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
          )}
        >
          {isApprove ? "Approve" : "Decline"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] rounded-lg p-4 sm:max-w-[500px] sm:p-6">
        <DialogHeader className="mb-5">
          <DialogTitle>
            {isApprove ? "Approve Mutation" : "Decline Mutation"}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Write your notes before moving stock to another warehouse"
              : "Write your reason to decline the mutation"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Notes
          </Label>
          <Textarea
            placeholder="Type your notes here"
            className="col-span-3 resize-none focus:border-gray-50"
            onChange={(e) => setReviewerNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleOnSubmit}
            disabled={submitMutation}
            className={
              isApprove
                ? ""
                : "border-2 border-slate-300 bg-white text-black hover:bg-slate-50 hover:text-black"
            }
          >
            {submitMutation ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductMutationReviewDialog;
