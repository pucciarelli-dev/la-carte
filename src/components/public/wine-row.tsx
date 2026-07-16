import type { CSSProperties } from "react";
import type { PublishedWineItem } from "@/types";
import { BISTROT_MENU_ITEM_CLASS } from "@/lib/bistrot-layout";
import { formatBistrotPrice, cn } from "@/lib/utils";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";

interface WineRowProps {
  item: PublishedWineItem;
  productStyle: CSSProperties;
  priceStyle: CSSProperties;
  ingredientStyle: CSSProperties;
  colored: boolean;
  showRegionUnderTitle?: boolean;
}

export function WineRow({
  item,
  productStyle,
  priceStyle,
  ingredientStyle,
  colored,
  showRegionUnderTitle = false,
}: WineRowProps) {
  const producer = item.producer?.trim() ?? "";
  const showProducerLine = producer.length > 0;
  const region = item.subcategory?.trim() ?? "";
  const showRegionLine = showRegionUnderTitle && region.length > 0;
  const meta = item.vintage?.trim() ?? "";
  const hasBottle = Boolean(item.bottlePrice);
  const hasGlass = Boolean(item.glassPrice);

  return (
    <section className={BISTROT_MENU_ITEM_CLASS}>
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          {showProducerLine ? (
            <>
              <p className={t.dishName} style={productStyle}>
                {producer.toUpperCase()}
              </p>
              <h3 className={cn(t.dishName, "mt-0.5")} style={productStyle}>
                {item.name.toUpperCase()}
              </h3>
            </>
          ) : (
            <h3 className={t.dishName} style={productStyle}>
              {item.name.toUpperCase()}
            </h3>
          )}
          {showRegionLine && (
            <p
              className={cn(
                "mt-1 text-xs font-normal tracking-wide",
                colored ? "text-current/60" : "text-[#8a8a8a]"
              )}
              style={ingredientStyle}
            >
              {region}
            </p>
          )}
          {meta && (
            <p
              className={cn(
                "mt-1 pr-4",
                t.itemMeta,
                colored && "text-current/72"
              )}
              style={ingredientStyle}
            >
              {meta}
            </p>
          )}
          {item.description && (
            <p
              className={cn(t.wineGrapes, colored && "text-current/72")}
              style={ingredientStyle}
            >
              {item.description}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right" style={priceStyle}>
          {hasGlass && hasBottle && (
            <span
              className={cn(t.itemPriceGlass, colored && "text-current/72")}
            >
              {formatBistrotPrice(item.glassPrice!)}
            </span>
          )}
          {hasBottle && (
            <span className={cn(t.dishPrice, colored && "text-inherit")}>
              {formatBistrotPrice(item.bottlePrice!)}
            </span>
          )}
          {hasGlass && !hasBottle && (
            <span className={cn(t.dishPrice, colored && "text-inherit")}>
              {formatBistrotPrice(item.glassPrice!)}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
