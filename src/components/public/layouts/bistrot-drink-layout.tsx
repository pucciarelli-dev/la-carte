import type { MenuRenderContext } from "@/lib/layouts";
import { DEFAULT_MENU_SUBTITLES } from "@/lib/layouts";
import { shouldShowMenuIntro } from "@/lib/menu-intro";
import {
  BISTROT_MENU_ARTICLE_CLASS,
  BISTROT_MENU_CONTENT_CLASS,
  BISTROT_MENU_ITEM_CLASS,
} from "@/lib/bistrot-layout";
import { fontFamilyStyle, BISTROT_DISH_INGREDIENT_FONT } from "@/lib/google-fonts";
import { formatBistrotPrice, cn } from "@/lib/utils";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";
import { BistrotCategoryHeading } from "@/components/public/bistrot-category-heading";
import { BistrotFallbackHeader } from "@/components/public/bistrot-fallback-header";
import { CategorySection } from "@/components/public/category-section";
import { MenuIntroSection } from "@/components/public/menu-intro-section";
import { MenuPageFooter } from "@/components/public/menu-page-footer";

export function BistrotDrinkLayout({
  categories,
  branding,
  typography,
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
          defaultSubtitle={DEFAULT_MENU_SUBTITLES.DRINK}
          typography={typography}
        />
      )}

      <div className={BISTROT_MENU_CONTENT_CLASS}>
        {categories.map((category) => {
          const items = (category.drinkItems ?? []).filter((i) => i.visible);
          if (!items.length) return null;

          const isMixerSection =
            category.name.toLowerCase().includes("mixer") ||
            category.name.toLowerCase().includes("analcolic");

          return (
            <CategorySection key={category.id} category={category}>
              <BistrotCategoryHeading
                as="h3"
                name={category.name}
                textColor={category.textColor}
                fillColor={category.backgroundColor}
              />

              {isMixerSection ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                  {items.map((item) => (
                    <div key={item.id} className={t.drinkMixer}>
                      <span className={t.dishName} style={productStyle}>
                        {item.name.toUpperCase()}
                      </span>
                      <span className={t.dishPrice} style={priceStyle}>
                        {formatBistrotPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                items.map((item) => (
                  <section key={item.id} className={BISTROT_MENU_ITEM_CLASS}>
                    <div className="flex items-center justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <h2 className={t.dishName} style={productStyle}>
                          {item.name.toUpperCase()}
                        </h2>
                        {item.ingredients && (
                          <p
                            className={cn("mt-1 pr-4", t.itemMeta)}
                            style={ingredientStyle}
                          >
                            {item.ingredients}
                          </p>
                        )}
                        {item.description && (
                          <p
                            className={cn("mt-1 pr-4", t.dishDescription)}
                            style={ingredientStyle}
                          >
                            {item.description.toUpperCase()}
                          </p>
                        )}
                      </div>
                      <span className={t.dishPrice} style={priceStyle}>
                        {formatBistrotPrice(item.price)}
                      </span>
                    </div>
                  </section>
                ))
              )}
            </CategorySection>
          );
        })}
      </div>

      <MenuPageFooter
        branding={branding}
        intro={intro}
        footerNoteIt={intro?.footerNoteIt}
        showAllergens={false}
        locale={locale}
      />
    </article>
  );
}
