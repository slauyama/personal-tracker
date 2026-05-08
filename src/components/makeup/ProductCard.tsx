import { useState } from "react";
import { ProductStatus } from "../../constants";
import { Product } from "../../hooks/useProducts";
import { Card, Text } from "../ui/UI";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index: number;
  totalProducts: number;
  onClick: () => void;
}

export default function ProductCard({
  product,
  index,
  totalProducts,
  onClick,
}: ProductCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  const isFinished = product.status === ProductStatus.Finished;
  const showImage = product.imageUrl && !imgBroken;

  return (
    <motion.div
      layout
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
      initial={{ opacity: 0, scale: 0.98, y: -6 }}
      animate={{
        opacity: isAnimating ? 0.98 : 1,
        scale: 1,
        y: 0,
        zIndex: isAnimating ? totalProducts - index + 1 : 1,
      }}
      exit={{ opacity: 0, scale: 0.98, y: 6 }}
      transition={{
        layout: {
          duration: (index / totalProducts) * 1 + 0.35,
          ease: "easeIn",
        },
        default: { duration: 0.25 },
      }}
      className="relative"
    >
      <Card
        onClick={onClick}
        className={`flex flex-col transition cursor-pointer hover:shadow-md hover:border-slate-200 dark:hover:border-slate-200 overflow-hidden ${
          isFinished ? "opacity-55" : "opacity-100"
        }`}
      >
        {showImage && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="bg-white w-full h-8/10 aspect-square object-cover"
            onError={() => setImgBroken(true)}
          />
        )}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {isFinished && (
            <div>
              <span className="text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 px-2 py-0.5 rounded-full">
                Finished
              </span>
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 leading-tight truncate">
              {product.name}
            </h3>
            {product.brand && (
              <Text variant="caption" className="font-thin mt-0.5 truncate">
                {product.brand}
              </Text>
            )}
            {product.shade && (
              <Text variant="caption" className="font-thin mt-0.5 truncate">
                Shade: {product.shade}
              </Text>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
