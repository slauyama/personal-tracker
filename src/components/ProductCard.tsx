import { useState } from "react";
import { CATEGORY_COLORS, ProductStatus } from "../constants";
import { Product } from "../hooks/useProducts";

interface ProductCardProps {
  product: Product;
  updateProductStatus: (id: string, status: ProductStatus) => void;
  onOpen: () => void;
}

export default function ProductCard({
  product,
  updateProductStatus,
  onOpen,
}: ProductCardProps) {
  const [imgBroken, setImgBroken] = useState(false);
  const colorClass =
    CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS["Other"];
  const isFinished = product.status === ProductStatus.Finished;
  const showImage = product.imageUrl && !imgBroken;

  return (
    <div
      onClick={onOpen}
      className={`bg-white rounded-xl border shadow-sm flex flex-col transition cursor-pointer hover:shadow-md hover:border-rose-200 overflow-hidden ${
        isFinished ? "opacity-55" : ""
      }`}
    >
      {showImage && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-8/10 aspect-square object-cover"
          onError={() => setImgBroken(true)}
        />
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex justify-between items-start gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${colorClass}`}
          >
            {product.category}
          </span>
          {isFinished && (
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
              Finished
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 leading-tight">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>
          )}
          {product.shade && (
            <p className="text-xs text-gray-400 mt-0.5">
              Shade: {product.shade}
            </p>
          )}
        </div>

        <div className="flex gap-2 items-center pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateProductStatus(
                product.id,
                isFinished ? ProductStatus.Active : ProductStatus.Finished,
              );
            }}
            className={
              isFinished
                ? "flex-1 text-xs bg-rose-50 text-rose-500 border border-rose-200 px-2 py-1.5 rounded-lg hover:bg-rose-100 transition"
                : "flex-1 text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
            }
          >
            Mark {isFinished ? "Active" : "Finished"}
          </button>
        </div>
      </div>
    </div>
  );
}
