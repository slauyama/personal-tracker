import { useMediaQuery } from "./useMediaQuery";

const SMALL = 640;
const MEDIUM = 768;
const LARGE = 1024;
const XLARGE = 1280;

export function useBreakpoints() {
  const isSmall = useMediaQuery(`(max-width: ${SMALL}px)`);
  const isMedium = useMediaQuery(`(max-width: ${MEDIUM}px)`);
  const isLarge = useMediaQuery(`(max-width: ${LARGE}px)`);
  const isXLarge = useMediaQuery(`(max-width: ${XLARGE}px)`);

  return { isSmall, isMedium, isLarge, isXLarge };
}
