import type { MenuTypography } from "@/lib/layouts";
import type { MenuAllergenEntry } from "@/lib/allergens";
import {
  DEFAULT_MENU_ALLERGENS,
  formatAllergenNumbers,
  formatAllergenLegendLine,
  getAllergenLegendTitle,
  getEnabledAllergens,
} from "@/lib/allergens";
import { CategorySection } from "@/components/public/category-section";
import type { PublishedCategoryWithItems } from "@/types";
import { fontFamilyStyle } from "@/lib/google-fonts";
import { classicMenuTypography as t } from "@/lib/menu-typography";
import { formatPrice, cn } from "@/lib/utils";
import { MENU_PRINT_ALLERGEN_LEGEND_CLASS } from "@/lib/menu-print";

interface Props {
  categories: PublishedCategoryWithItems[];
  typography: MenuTypography;
  allergenLegend?: MenuAllergenEntry[];
  showAllergenLegend?: boolean;
}

export function PublicDinnerMenu({
  categories,
  typography,
  allergenLegend,
  showAllergenLegend = true,
}: Props) {
  const categoryStyle = fontFamilyStyle(typography.categoryFont, "serif");
  const productStyle = fontFamilyStyle(typography.productFont, "sans-serif");
  const priceStyle = fontFamilyStyle(typography.priceFont, "sans-serif");
  const legend = getEnabledAllergens(
    allergenLegend && allergenLegend.length > 0
      ? allergenLegend
      : DEFAULT_MENU_ALLERGENS
  );

  return (
    <div>
      {categories.map((category) => {
        const items = (category.menuItems ?? []).filter((i) => i.visible);
        if (items.length === 0) return null;

        return (
          <CategorySection key={category.id} category={category}>
            <h2
              className={t.category}
              style={categoryStyle}
            >
              {category.name}
            </h2>
            <div className="space-y-5">
              {items.map((item) => {
                const allergenStr = formatAllergenNumbers(item.allergens);
                return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={t.itemName}
                        style={productStyle}
                      >
                        {item.name}
                      </h3>
                      {item.isVegetarian && (
                        <span className={t.badge}>V</span>
                      )}
                      {item.isVegan && (
                        <span className={t.badge}>VG</span>
                      )}
                      {item.isGlutenFree && (
                        <span className={t.badge}>SG</span>
                      )}
                      {item.isSpicy && <span className="text-sm">🌶</span>}
                      {allergenStr && (
                        <span className={t.badge}>
                          [{allergenStr}]
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className={t.itemDescription}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={t.price}
                    style={priceStyle}
                  >
                    {formatPrice(item.price)}
                  </span>
                </div>
              );
              })}
            </div>
          </CategorySection>
        );
      })}

      {showAllergenLegend && legend.length > 0 && (
        <section className={t.legend}>
          <p className={t.legendTitle}>
            {getAllergenLegendTitle()}
          </p>
          <div className={cn(MENU_PRINT_ALLERGEN_LEGEND_CLASS, "grid gap-2 sm:grid-cols-2")}>
            {legend.map((entry) => (
              <p key={entry.num}>
                {formatAllergenLegendLine(entry)}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
