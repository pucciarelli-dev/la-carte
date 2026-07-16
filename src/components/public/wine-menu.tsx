import type { MenuTypography } from "@/lib/layouts";
import type { PublishedCategoryWithItems } from "@/types";
import { ClassicWineCategoriesAccordion } from "@/components/public/wine-categories-accordion";

interface Props {
  categories: PublishedCategoryWithItems[];
  typography: MenuTypography;
  expandAll?: boolean;
  forceMountPanels?: boolean;
}

export function PublicWineMenu({
  categories,
  typography,
  expandAll = false,
  forceMountPanels = false,
}: Props) {
  return (
    <ClassicWineCategoriesAccordion
      categories={categories}
      typography={typography}
      expandAll={expandAll}
      forceMountPanels={forceMountPanels}
    />
  );
}
