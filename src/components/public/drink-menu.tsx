import type { MenuTypography } from "@/lib/layouts";
import { CategorySection } from "@/components/public/category-section";
import type { PublishedCategoryWithItems } from "@/types";
import { fontFamilyStyle } from "@/lib/google-fonts";
import { classicMenuTypography as t } from "@/lib/menu-typography";
import { formatPrice } from "@/lib/utils";

interface Props {
  categories: PublishedCategoryWithItems[];
  typography: MenuTypography;
}

export function PublicDrinkMenu({ categories, typography }: Props) {
  const categoryStyle = fontFamilyStyle(typography.categoryFont, "serif");
  const productStyle = fontFamilyStyle(typography.productFont, "sans-serif");
  const priceStyle = fontFamilyStyle(typography.priceFont, "sans-serif");

  return (
    <div>
      {categories.map((category) => {
        const items = (category.drinkItems ?? []).filter((i) => i.visible);
        if (items.length === 0) return null;

        return (
          <CategorySection key={category.id} category={category}>
            <h2 className={t.category} style={categoryStyle}>
              {category.name}
            </h2>
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <h3 className={t.itemName} style={productStyle}>
                      {item.name}
                    </h3>
                    {item.ingredients && (
                      <p className={t.itemIngredients}>
                        {item.ingredients}
                      </p>
                    )}
                    {item.description && (
                      <p className={t.itemDescriptionMuted}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className={t.price} style={priceStyle}>
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </CategorySection>
        );
      })}
    </div>
  );
}
