"use client";

import React, { FC, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_PRODUCT_CATEGORY_PER_PAGE } from "@/constant/productConstant";
import { getPaginatedProductCategories } from "@/api/product/getProducts";
import { PaginationAdmin } from "@/components/pagination/PaginationAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import EditProductCategoryDialog from "@/components/product-management/categories/EditProductCategoryDialog";
import { useProductAdmin } from "@/store/productAdminStore";
import DeleteProductCategoryAlert from "@/components/product-management/categories/DeleteProductCategoryAlert";
import { userRoles } from "@/constant/userConstant";

const ProductCategoryTable: FC = () => {
  const [page, setPage] = useState<number>(0);
  const { data } = useSession();
  const { updateProductCategory } = useProductAdmin();

  const {
    data: productCategories,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["product-category-table", page, updateProductCategory],
    queryFn: () =>
      getPaginatedProductCategories({
        page,
        limit: ADMIN_PRODUCT_CATEGORY_PER_PAGE,
        accessToken: data?.accessToken,
      }),
    enabled: !!data?.accessToken,
  });

  const renderLoading = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[10%]">
              <Skeleton className="h-8 w-[80%]" />
            </TableHead>
            <TableHead className="w-[45%]">
              <Skeleton className="h-8 w-[90%]" />
            </TableHead>
            <TableHead className="w-[45%] text-center">
              <Skeleton className="mx-auto h-8 w-[60%]" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: ADMIN_PRODUCT_CATEGORY_PER_PAGE }).map(
            (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-[40%]" />
                </TableCell>
                <TableCell>
                  <Skeleton
                    className={`h-6 w-[${70 + Math.floor(Math.random() * 20)}%]`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-8">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    );
  };

  const renderError = () => {
    return <div>Error loading product categories.</div>;
  };

  const renderContent = () => {
    return (
      <div className="w-full md:min-h-[calc(100vh-300px)]">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Product Category Name</TableHead>
              {data?.role === userRoles.ADMIN_SUPER && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {productCategories?.content.map((productCategory) => (
              <TableRow key={productCategory.id}>
                <TableCell>{productCategory.id}</TableCell>
                <TableCell>{productCategory.name}</TableCell>
                {data?.role === userRoles.ADMIN_SUPER && (
                  <TableCell>
                    <div className="flex justify-center gap-8">
                      <EditProductCategoryDialog
                        id={productCategory.id}
                        name={productCategory.name}
                      />
                      <DeleteProductCategoryAlert
                        id={productCategory.id}
                        name={productCategory.name}
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <section className="w-full space-y-2 rounded-lg shadow-sm">
      <div className="flex min-h-[calc(100vh-155px)] flex-col justify-between rounded-lg bg-white px-4 pt-5 md:px-10 md:pt-10">
        <div className="flex flex-grow items-center justify-center">
          {isLoading
            ? renderLoading()
            : isError
              ? renderError()
              : renderContent()}
        </div>

        {productCategories && productCategories.content.length > 0 && (
          <div className="py-2">
            <PaginationAdmin
              desc="Product Category"
              page={page}
              setPage={setPage}
              totalPages={productCategories?.totalPages}
              totalElements={productCategories?.totalElements}
              currentPageSize={productCategories?.content.length}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCategoryTable;
