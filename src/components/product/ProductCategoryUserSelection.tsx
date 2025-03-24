import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductCategory } from "@/api/product/getProducts";
import { useProductUser } from "@/store/productUserStore";

const ProductCategoryUserSelection: FC = () => {
  const { productCategoryId, setProductCategoryId, setProductPage } =
    useProductUser();

  const {
    data: categoriesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getProductCategory,
  });
  const categories = categoriesResponse?.data;

  return (
    <div>
      <div className="h-[320px] overflow-y-auto">
        {isLoading ? (
          <div className="flex animate-pulse flex-col gap-5 p-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="rounded-md bg-gray-200 p-4"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-3 text-red-500">
            {error ? error.message : "Error loading categories"}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              className={`w-full rounded-md p-2 text-left transition-colors ${
                !productCategoryId
                  ? "font-medium text-black"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => {
                setProductCategoryId(undefined);
                setProductPage(0);
              }}
            >
              All Categories
            </button>
            {categories?.map((category) => (
              <button
                key={category.id}
                className={`w-full rounded-md p-2 text-left transition-colors ${
                  productCategoryId === category.id
                    ? "font-medium text-black"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setProductCategoryId(category.id);
                  setProductPage(0);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCategoryUserSelection;
