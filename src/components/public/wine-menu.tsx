import type { MenuTypography } from "@/lib/layouts";
import type { PublishedCategoryWithItems } from "@/types";
import { ClassicWineCategoriesAccordion } from "@/components/public/wine-categories-accordion";

interface Props {
  categories: PublishedCategoryWithItems[];
  typography: MenuTypography;
  expandAll?: boolean;
}

export function PublicWineMenu({ categories, typography, expandAll = false }: Props) {
  return (
    <ClassicWineCategoriesAccordion
      categories={categories}
      typography={typography}
      expandAll={expandAll}
    />
  );
}
