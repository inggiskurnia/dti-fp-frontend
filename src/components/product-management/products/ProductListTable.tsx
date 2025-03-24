import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedProducts } from "@/api/product/getProducts";
import { ADMIN_PRODUCT_PER_PAGE } from "@/constant/productConstant";
import { Card, CardContent } from "@/components/ui/card";
import ImageComponent from "@/components/common/ImageComponent";
import { formatPrice } from "@/utils/formatter";
import ActionButtons from "@/components/product-management/products/ActionButtons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationAdmin } from "@/components/pagination/PaginationAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import ViewIcon from "@/components/icon/ViewIcon";
import EditIcon from "@/components/icon/EditIcon";
import { useProductAdmin } from "@/store/productAdminStore";
import { useSession } from "next-auth/react";
import { userRoles } from "@/constant/userConstant";
import DeleteProductAlert from "@/components/product-management/products/DeleteProductAlert";

const ProductListTable: FC = () => {
  const {
    productPage,
    productCategoryId,
    searchQuery,
    updateProduct,
    setProductPage,
  } = useProductAdmin();
  const { data } = useSession();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: [
      "products-admin",
      productPage,
      productCategoryId,
      searchQuery,
      updateProduct,
    ],
    queryFn: () =>
      getPaginatedProducts({
        page: productPage,
        limit: ADMIN_PRODUCT_PER_PAGE,
        productCategoryId,
        searchQuery,
      }),
    enabled: !!data?.accessToken,
  });

  const renderEmptyState = () => (
    <div className="flex flex-col text-center text-gray-500">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium">No products found</h3>
    </div>
  );

  const renderLoading = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">
              <Skeleton className="h-8 w-[80%]" />
            </TableHead>
            <TableHead className="w-[20%]">
              <Skeleton className="h-8 w-[90%]" />
            </TableHead>
            <TableHead className="w-[10%] text-center">
              <Skeleton className="mx-auto h-8 w-[60%]" />
            </TableHead>
            <TableHead className="w-[15%] text-center">
              <Skeleton className="mx-auto h-8 w-[60%]" />
            </TableHead>
            <TableHead className="w-[15%] text-center">
              <Skeleton className="mx-auto h-8 w-[60%]" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: ADMIN_PRODUCT_PER_PAGE }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-6 w-[60%]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[80%]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[60%]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[80%]" />
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-8">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-5 w-5 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderMobileView = () => (
    <div className="w-full space-y-4 md:hidden">
      {products?.content.map((product) => (
        <Card key={product.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                <ImageComponent
                  src={product.thumbnail}
                  className="object-cover"
                  alt={`${product.name} thumbnail`}
                  fill={true}
                  sizes="50px, 50px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-gray-800">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500">ID: {product.id}</p>
                <span className="mt-1 inline-block truncate rounded-full bg-gray-200 px-3 py-1 text-sm">
                  {product.categoryName}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-medium text-gray-800">
                {formatPrice(String(product.price))}
              </span>
              <div className="flex space-x-2">
                <ActionButtons productId={product.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDesktopTable = () => (
    <div className="hidden w-full md:block md:min-h-[calc(100vh-300px)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead className="w-[20%]">Category</TableHead>
            <TableHead className="w-[10%]">Price</TableHead>
            <TableHead className="w-[15%] text-center">Thumbnail</TableHead>
            <TableHead className="w-[15%] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.content.map((product) => (
            <TableRow key={product.id} className="hover:bg-gray-50">
              <TableCell className="min-w-0">
                <div className="truncate font-medium text-gray-800">
                  {product.name}
                </div>
                <div className="truncate text-xs text-gray-500">
                  ID: {product.id}
                </div>
              </TableCell>
              <TableCell className="min-w-0">
                <span className="inline-block max-w-full truncate rounded-full bg-gray-200 px-3 py-1 text-sm">
                  {product.categoryName}
                </span>
              </TableCell>
              <TableCell className="truncate font-medium text-gray-800">
                {formatPrice(String(product.price))}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                    <ImageComponent
                      src={product.thumbnail}
                      fill={true}
                      className="object-cover"
                      alt={`${product.name} thumbnail`}
                      sizes="50px, 50px"
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-4">
                  <Link href={`/admin/product-management/${product.id}`}>
                    <ViewIcon />
                  </Link>
                  {data?.role === userRoles.ADMIN_SUPER && (
                    <>
                      <Link
                        href={`/admin/product-management/form/${product.id}`}
                      >
                        <EditIcon />
                      </Link>
                      <DeleteProductAlert id={product.id} name={product.name} />
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <section className="w-full space-y-2 rounded-lg shadow-sm">
      <div className="flex min-h-[calc(100vh-155px)] flex-col justify-between rounded-lg bg-white px-7 pt-5 md:pt-10">
        <div className="flex flex-grow items-center justify-center">
          {productsLoading ? (
            renderLoading()
          ) : products?.content.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {renderDesktopTable()}
              {renderMobileView()}
            </>
          )}
        </div>

        {products && products.content.length > 0 && (
          <div className="py-2">
            <PaginationAdmin
              desc="Products"
              page={productPage}
              setPage={setProductPage}
              totalPages={products.totalPages}
              totalElements={products.totalElements}
              currentPageSize={products.content.length}
            />
          </div>
        )}
      </div>
    </section>
  );
};
export default ProductListTable;
