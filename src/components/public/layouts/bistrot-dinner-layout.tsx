import type { CSSProperties } from "react";
import type { MenuRenderContext } from "@/lib/layouts";
import type { PublishedMenuItem } from "@/types";
import { formatAllergenNumbers } from "@/lib/allergens";
import { fontFamilyStyle, BISTROT_DISH_INGREDIENT_FONT } from "@/lib/google-fonts";
import { shouldShowMenuIntro } from "@/lib/menu-intro";
import {
  BISTROT_MENU_ARTICLE_CLASS,
  BISTROT_MENU_CONTENT_CLASS,
  BISTROT_MENU_ITEM_CLASS,
} from "@/lib/bistrot-layout";
import {
  hasCategoryAppearance,
  CATEGORY_THEMED_CLASS,
} from "@/lib/category-styles";
import { formatBistrotPrice, cn } from "@/lib/utils";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";
import { MenuIntroSection } from "@/components/public/menu-intro-section";
import { MenuPageFooter } from "@/components/public/menu-page-footer";
import { BistrotCategoryHeading } from "@/components/public/bistrot-category-heading";
import { BistrotFallbackHeader } from "@/components/public/bistrot-fallback-header";
import { CategorySection } from "@/components/public/category-section";
import { DEFAULT_MENU_SUBTITLES } from "@/lib/layouts";

export function BistrotDinnerLayout({
  categories,
  branding,
  typography,
  allergenLegend,
  coverImageUrl,
  coverVideoUrl,
  intro,
  subtitle,
  menuType,
  locale = "it",
}: MenuRenderContext) {
  const productStyle = fontFamilyStyle(typography.productFont, "sans-serif");
  const priceStyle = fontFamilyStyle(typography.priceFont, "sans-serif");
  const ingredientStyle = {
    ...fontFamilyStyle(BISTROT_DISH_INGREDIENT_FONT, "sans-serif"),
    fontWeight: 400,
  };
  const showIntro = shouldShowMenuIntro(intro, coverImageUrl, coverVideoUrl);

  return (
    <article className={BISTROT_MENU_ARTICLE_CLASS}>
      {showIntro ? (
        <MenuIntroSection
          intro={intro}
          branding={branding}
          menuType={menuType}
          subtitle={subtitle}
          coverImageUrl={coverImageUrl}
          coverVideoUrl={coverVideoUrl}
        />
      ) : (
        <BistrotFallbackHeader
          branding={branding}
          subtitle={subtitle}
          defaultSubtitle={DEFAULT_MENU_SUBTITLES.DINNER}
          typography={typography}
        />
      )}

      <div className={BISTROT_MENU_CONTENT_CLASS}>
        {categories.map((category) => {
          const items = (category.menuItems ?? []).filter((i) => i.visible);
          if (!items.length) return null;

          const isColored = hasCategoryAppearance(category);

          return (
            <CategorySection
              key={category.id}
              category={category}
              className={cn(isColored && category.textColor && CATEGORY_THEMED_CLASS)}
            >
              <BistrotCategoryHeading
                as="h3"
                name={category.name}
                textColor={category.textColor}
                fillColor={category.backgroundColor}
              />
              {items.map((item) => (
                <DishRow
                  key={item.id}
                  item={item}
                  productStyle={productStyle}
                  priceStyle={priceStyle}
                  ingredientStyle={ingredientStyle}
                  colored={isColored}
                />
              ))}
            </CategorySection>
          );
        })}
      </div>

      <MenuPageFooter
        branding={branding}
        intro={intro}
        footerNoteIt={intro?.footerNoteIt}
        allergenLegend={allergenLegend}
        showAllergens={branding.showAllergenLegend !== false}
        locale={locale}
      />
    </article>
  );
}

function DishRow({
  item,
  productStyle,
  priceStyle,
  ingredientStyle,
  colored,
}: {
  item: PublishedMenuItem;
  productStyle: CSSProperties;
  priceStyle: CSSProperties;
  ingredientStyle: CSSProperties;
  colored: boolean;
}) {
  const allergenStr = formatAllergenNumbers(item.allergens);
  const mutedClass = cn(
    t.dishDescription,
    colored ? "text-current/72" : "text-[#5c5c5c]"
  );
  const allergenClass = cn(
    "dish-muted",
    colored ? "text-current/72" : "text-[#8a8a8a]"
  );

  return (
    <section className={BISTROT_MENU_ITEM_CLASS}>
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h2 className={t.dishName} style={productStyle}>
            {item.name.toUpperCase()}
          </h2>
          {item.description && (
            <p className={cn("mt-1 pr-4", mutedClass)} style={ingredientStyle}>
              {item.description.toUpperCase()}
              {allergenStr && (
                <span className={allergenClass}> | {allergenStr}</span>
              )}
            </p>
          )}
          {!item.description && allergenStr && (
            <p className={cn("mt-1 pr-4", mutedClass)} style={ingredientStyle}>
              <span className={allergenClass}>{allergenStr}</span>
            </p>
          )}
        </div>
        <span className={cn(t.dishPrice, colored && "text-inherit")} style={priceStyle}>
          {formatBistrotPrice(item.price)}
        </span>
      </div>
    </section>
  );
}
