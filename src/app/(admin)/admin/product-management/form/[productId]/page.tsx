"use client";

import { getProductDetailById } from "@/api/product/getProducts";
import ProductManagementHeader from "@/components/product-management/ProductManagementHeader";
import ProductFormComponent from "@/components/product-management/products/ProductForm";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { FC } from "react";

const EditProductFormPage: FC = () => {
  const { productId } = useParams();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductDetailById({ productId: Number(productId) }),
  });

  return (
    <section className="min-h-[calc(100vh-178px)] w-full space-y-2 rounded-lg shadow-sm md:py-7">
      <ProductManagementHeader />

      <div className="md:px-17 flex w-full justify-center overflow-x-auto rounded-lg bg-white px-4 py-5 text-gray-600 md:py-10">
        {data && !isLoading && !isFetching && (
          <ProductFormComponent props={data} />
        )}
      </div>
    </section>
  );
};

export default EditProductFormPage;
