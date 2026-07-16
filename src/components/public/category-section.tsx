import type { ReactNode } from "react";
import type { PublishedCategory } from "@/types";
import { cn } from "@/lib/utils";
import {
  getCategoryBlockStyle,
  getCategorySectionClassName,
  hasCategoryAppearance,
  CATEGORY_BAND_INNER_CLASS,
  CATEGORY_SECTION_TOP_PADDING_CLASS,
  CATEGORY_SECTION_BOTTOM_PADDING_CLASS,
} from "@/lib/category-styles";
import { CategorySectionFooter } from "@/components/public/category-section-footer";
import {
  MENU_PRINT_PAGE_SECTION_CLASS,
  MENU_PRINT_PAGE_COLORED_CLASS,
  MENU_PRINT_PAGE_INNER_CLASS,
  MENU_PRINT_CATEGORY_CONTENT_CLASS,
  MENU_PRINT_CATEGORY_HAS_FOOTER_CLASS,
} from "@/lib/menu-print";

interface CategorySectionProps {
  category: Pick<
    PublishedCategory,
    "name" | "backgroundColor" | "textColor" | "footerImageUrl"
  >;
  className?: string;
  collapsed?: boolean;
  hideFooter?: boolean;
  children: ReactNode;
}

export function CategorySection({
  category,
  className,
  collapsed = false,
  hideFooter = false,
  children,
}: CategorySectionProps) {
  const isColored = hasCategoryAppearance(category);
  const hasFooterImage = Boolean(category.footerImageUrl) && !collapsed && !hideFooter;
  const contentPadding = cn(
    CATEGORY_SECTION_TOP_PADDING_CLASS,
    !hasFooterImage && CATEGORY_SECTION_BOTTOM_PADDING_CLASS,
    collapsed && "pb-6"
  );

  const sectionInner = (
    <div className={cn(MENU_PRINT_PAGE_INNER_CLASS, CATEGORY_BAND_INNER_CLASS, contentPadding)}>
      <div className={MENU_PRINT_CATEGORY_CONTENT_CLASS}>{children}</div>
      {hasFooterImage && <CategorySectionFooter category={category} />}
    </div>
  );

  if (!isColored) {
    return (
      <section
        className={cn(
          MENU_PRINT_PAGE_SECTION_CLASS,
          hasFooterImage && MENU_PRINT_CATEGORY_HAS_FOOTER_CLASS,
          className
        )}
      >
        {sectionInner}
      </section>
    );
  }

  return (
    <section
      style={getCategoryBlockStyle(category)}
      className={getCategorySectionClassName(
        category,
        cn(
          MENU_PRINT_PAGE_SECTION_CLASS,
          category.backgroundColor && MENU_PRINT_PAGE_COLORED_CLASS,
          hasFooterImage && MENU_PRINT_CATEGORY_HAS_FOOTER_CLASS,
          className
        )
      )}
    >
      {sectionInner}
    </section>
  );
}
