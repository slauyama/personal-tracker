import { useState } from "react";
import { Product } from "../../hooks/useProducts";
import { Card, Text } from "@slauyama/ui";
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
        className="flex flex-col transition cursor-pointer hover:shadow-md hover overflow-hidden"
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
          <div className="flex-1">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 leading-tight truncate">
              {product.name}
            </h3>
            {product.brand && (
              <Text size="sm" className="font-thin mt-0.5 truncate">
                {product.brand}
              </Text>
            )}
            {product.shade && (
              <Text size="sm" className="font-thin mt-0.5 truncate">
                Shade: {product.shade}
              </Text>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
