import type { PublishedCategory } from "@/types";
import {
  hasCategoryAppearance,
  categoryUsesLightIcon,
} from "@/lib/category-styles";
import { CategoryFooterImage } from "@/components/public/category-footer-image";
import { BistrotWaveDivider } from "@/components/public/bistrot-wave-divider";
import {
  MENU_PRINT_CATEGORY_FLEX_SPACER_CLASS,
  MENU_PRINT_CATEGORY_WAVE_CLASS,
  MENU_PRINT_CATEGORY_FOOTER_CLASS,
} from "@/lib/menu-print";

interface CategorySectionFooterProps {
  category: Pick<
    PublishedCategory,
    "name" | "backgroundColor" | "textColor" | "footerImageUrl"
  >;
}

export function CategorySectionFooter({ category }: CategorySectionFooterProps) {
  if (!category.footerImageUrl) return null;

  const isColored = hasCategoryAppearance(category);

  return (
    <>
      <div className={MENU_PRINT_CATEGORY_FLEX_SPACER_CLASS} aria-hidden />
      <BistrotWaveDivider
        inverted={isColored && categoryUsesLightIcon(category)}
        className={MENU_PRINT_CATEGORY_WAVE_CLASS}
      />
      <div className={MENU_PRINT_CATEGORY_FLEX_SPACER_CLASS} aria-hidden />
      <div className={MENU_PRINT_CATEGORY_FOOTER_CLASS}>
        <CategoryFooterImage src={category.footerImageUrl} alt={category.name} />
      </div>
    </>
  );
}
