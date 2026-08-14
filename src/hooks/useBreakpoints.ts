import { useMediaQuery } from "./useMediaQuery";

export function useBreakpoints() {
  const isSmall = useMediaQuery(`(max-width: 640px)`);
  const isMedium = useMediaQuery(`(max-width: 768px)`);
  const isLarge = useMediaQuery(`(max-width: 1024px)`);
  const isXLarge = useMediaQuery(`(max-width: 1280px)`);

  return { isSmall, isMedium, isLarge, isXLarge };
}
