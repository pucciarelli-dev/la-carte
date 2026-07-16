import type { CSSProperties } from "react";
import type { PublishedWineItem } from "@/types";
import { groupWineItemsBySubcategory } from "@/lib/wine-menu";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";
import { cn } from "@/lib/utils";
import { WineRow } from "@/components/public/wine-row";

interface WineCategoryListProps {
  items: PublishedWineItem[];
  productStyle: CSSProperties;
  priceStyle: CSSProperties;
  ingredientStyle: CSSProperties;
  colored: boolean;
  groupBySubcategory?: boolean;
}

export function WineCategoryList({
  items,
  productStyle,
  priceStyle,
  ingredientStyle,
  colored,
  groupBySubcategory = true,
}: WineCategoryListProps) {
  const subcategoryGroups = groupBySubcategory
    ? groupWineItemsBySubcategory(items)
    : [{ label: "", items }];

  return (
    <>
      {subcategoryGroups.map((group, groupIndex) => (
        <div key={group.items[0]?.id ?? `group-${groupIndex}`}>
          {group.label && (
            <p
              className={cn(t.wineCategoryHeading, groupIndex === 0 && "mt-6")}
            >
              {group.label.toUpperCase()}
            </p>
          )}
          {group.items.map((item) => (
            <WineRow
              key={item.id}
              item={item}
              productStyle={productStyle}
              priceStyle={priceStyle}
              ingredientStyle={ingredientStyle}
              colored={colored}
              showRegionUnderTitle={!groupBySubcategory}
            />
          ))}
        </div>
      ))}
    </>
  );
}
