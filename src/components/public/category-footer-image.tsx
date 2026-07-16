import { cn } from "@/lib/utils";
import { MENU_PRINT_CATEGORY_FOOTER_IMAGE_CLASS } from "@/lib/menu-print";

interface CategoryFooterImageProps {
  src: string;
  alt: string;
}

export function CategoryFooterImage({ src, alt }: CategoryFooterImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      className={cn(
        MENU_PRINT_CATEGORY_FOOTER_IMAGE_CLASS,
        "menu-section-image mt-12 block w-full object-cover"
      )}
    />
  );
}
