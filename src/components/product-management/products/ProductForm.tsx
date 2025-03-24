"use client";

import React, { FC, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ProductDetail, ProductForm } from "@/types/models/products";
import { postFileBuilderIo } from "@/api/builder-io/postBuilderIo";
import { Button } from "../../ui/button";
import ProductCategorySelection from "@/components/product-management/categories/ProductCategorySelection";
import { toast } from "@/hooks/use-toast";
import ProductImageUpload from "@/components/product-management/products/ProductImageUpload";
import { updateProductById } from "@/api/product/putProducts";
import { useParams, useRouter } from "next/navigation";
import { createProduct } from "@/api/product/createProduct";
import AlertDialogComponent from "@/components/common/AlertDialogComponent";
import { useSession } from "next-auth/react";

interface ProductFormProps {
  props?: ProductDetail;
}

const ProductFormComponent: FC<ProductFormProps> = ({ props }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<
    Map<number, string | File>
  >(new Map());
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const { productId } = useParams();
  const router = useRouter();
  const { data } = useSession();

  const initialValues: ProductForm = {
    name: props?.name ?? "",
    price: props?.price ?? 0,
    description: props?.description ?? "",
    weight: props?.weight ?? 0,
    height: props?.height ?? 0,
    width: props?.width ?? 0,
    length: props?.length ?? 0,
    images: props?.images ?? [],
    productCategoryId: props?.category.id ?? 0,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must not exceed 100 characters")
      .required("Name is required"),
    price: Yup.number()
      .min(0, "Price must be greater than or equal to 0")
      .required("Price is required"),
    description: Yup.string()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must not exceed 1000 characters")
      .required("Description is required"),
    weight: Yup.number()
      .min(0, "Weight must be greater than or equal to 0")
      .nullable(),
    height: Yup.number()
      .min(0, "Height must be greater than or equal to 0")
      .nullable(),
    width: Yup.number()
      .min(0, "Width must be greater than or equal to 0")
      .nullable(),
    length: Yup.number()
      .min(0, "Length must be greater than or equal to 0")
      .nullable(),
    productCategoryId: Yup.number()
      .nonNullable()
      .min(1, "Category is required")
      .required("Category is required"),
  });

  const handleOnSubmit = async (values: ProductForm) => {
    try {
      setIsSubmitting(true);
      const uploadPromise = Array.from(selectedImages.entries()).map(
        async ([key, val]) => {
          if (val instanceof File) {
            const response = await postFileBuilderIo({
              name: val.name,
              altText: val.name,
              folder: process.env.NEXT_PUBLIC_BUILDER_IO_PRODUCT_FOLDER_ID,
              file: val,
            });
            return {
              url: response.url,
              position: key,
            };
          }
          return {
            url: val,
            position: key,
          };
        },
      );

      if (!data?.accessToken) return;

      const responses = await Promise.all(uploadPromise);
      values.images = responses.map((response) => response);
      if (productId) {
        const response = await updateProductById(Number(productId), values);
        if (response.success) {
          setOpenAlert(true);
        }
      } else {
        const response = await createProduct(values);
        if (response.success) {
          setOpenAlert(true);
        }
      }
    } catch {
      setIsSubmitting(false);
      toast({
        title: "Failed to upload images",
        description: "Please try again",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => handleOnSubmit(values)}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Basic Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_3fr]">
                <div className="">
                  <label className="block font-medium text-gray-700">
                    Product Name
                  </label>
                </div>
                <div className="space-y-2">
                  <Field
                    name="name"
                    type="text"
                    className={"h-10 w-full rounded-md border-2 px-3"}
                    placeholder="Product name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="block font-medium text-gray-700">
                    Price
                  </label>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                    <span className="font-semibold">Rp</span>
                    <Field
                      name="price"
                      type="number"
                      className={"h-10 w-full rounded-md border-2 px-3"}
                      placeholder="Product price"
                    />
                  </div>
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                <div className="flex items-start pt-2">
                  <label className="block font-medium text-gray-700">
                    Description
                  </label>
                </div>
                <div className="space-y-2">
                  <Field
                    as="textarea"
                    name="description"
                    className={"h-32 w-full rounded-md border-2 p-3"}
                    placeholder="Product description"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Product Images</h2>
              <div className="space-y-4">
                <label className="block font-medium text-gray-700">
                  Upload up to 5 images with maximum size of 1 MB each
                </label>
                <ProductImageUpload
                  existingImage={props?.images}
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                />
                <ErrorMessage
                  name="images"
                  component="div"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Product Dimensions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {["weight", "height", "width", "length"].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="block font-medium capitalize text-gray-700">
                      {field} ({field === "weight" ? "kg" : "cm"})
                    </label>
                    <Field
                      name={field}
                      type="number"
                      className={"h-10 w-full rounded-md border-2 px-3"}
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Category</h2>
              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_3fr]">
                <label className="block font-medium text-gray-700">
                  Select Category
                </label>
                <div className="space-y-2">
                  <ProductCategorySelection
                    productCategoryId={values.productCategoryId}
                    setProductCategoryId={(value) => {
                      setFieldValue("productCategoryId", value);
                    }}
                    captionNoSelection="Select Product Category"
                  />
                  <ErrorMessage
                    name="categoryId"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-full w-40"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
      <AlertDialogComponent
        open={openAlert}
        setOpen={setOpenAlert}
        title={productId ? "Update Product " : "Create New Product"}
        description={
          productId
            ? "Successfully updated product"
            : "Successfully created product"
        }
        cancelText="Cancel"
        onCancel={() => {
          router.push("/admin/product-management");
          setOpenAlert(false);
        }}
      />
    </>
  );
};

export default ProductFormComponent;
