import { useState } from "react";
import { ProductStatus } from "../constants";
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
        {isFinished && (
          <div>
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
              Finished
            </span>
          </div>
        )}

        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 leading-tight truncate">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {product.brand}
            </p>
          )}
          {product.shade && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Shade: {product.shade}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
