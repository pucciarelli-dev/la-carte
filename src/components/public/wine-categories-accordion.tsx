"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import type { MenuTypography } from "@/lib/layouts";
import type { PublishedCategoryWithItems } from "@/types";
import {
  hasCategoryAppearance,
  CATEGORY_THEMED_CLASS,
} from "@/lib/category-styles";
import { fontFamilyStyle, BISTROT_DISH_INGREDIENT_FONT } from "@/lib/google-fonts";
import { classicMenuTypography as classicT } from "@/lib/menu-typography";
import { cn, formatPrice } from "@/lib/utils";
import { CategorySection } from "@/components/public/category-section";
import { CategorySectionFooter } from "@/components/public/category-section-footer";
import { BistrotCategoryHeading } from "@/components/public/bistrot-category-heading";
import { WineCategoryList } from "@/components/public/wine-category-list";
import { sortWineItemsByPriceAsc } from "@/lib/wine-menu";
import {
  WINE_ACCORDION_CONTENT_CLASS,
  MENU_PRINT_CATEGORY_HAS_FOOTER_CLASS,
} from "@/lib/menu-print";

const WINE_ACCORDION_OPEN_MS = 600;
const WINE_ACCORDION_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getMenuStickyOffset() {
  if (typeof document === "undefined") return 12;

  let offset = 12;
  const stickyElements = document.querySelectorAll<HTMLElement>(
    ".menu-print-chrome.sticky, header.sticky, [class*='sticky'][class*='top-0']"
  );

  for (const element of stickyElements) {
    const rect = element.getBoundingClientRect();
    if (rect.height > 0 && rect.top <= 1) {
      offset = Math.max(offset, rect.bottom);
    }
  }

  return offset;
}

function scrollAccordionSectionToTop(section: HTMLElement, behavior: ScrollBehavior) {
  const offset = getMenuStickyOffset();
  const target = section.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, target), left: 0, behavior });
}

function pinAccordionSectionToTop(section: HTMLElement, behavior: ScrollBehavior) {
  scrollAccordionSectionToTop(section, behavior);

  const startedAt = performance.now();
  const pin = () => {
    if (performance.now() - startedAt >= WINE_ACCORDION_OPEN_MS) return;
    scrollAccordionSectionToTop(section, "auto");
    requestAnimationFrame(pin);
  };

  requestAnimationFrame(pin);
}

interface WineAccordionTriggerProps {
  id: string;
  isOpen: boolean;
  className?: string;
  children: ReactNode;
}

function WineAccordionTrigger({
  id,
  isOpen,
  className,
  children,
}: WineAccordionTriggerProps) {
  return (
    <Accordion.Header className="m-0">
      <Accordion.Trigger asChild>
        <button
          type="button"
          id={`wine-category-${id}`}
          aria-expanded={isOpen}
          className={cn(
            "flex w-full cursor-pointer justify-center border-0 bg-transparent p-0 text-inherit",
            className
          )}
        >
          {children}
        </button>
      </Accordion.Trigger>
    </Accordion.Header>
  );
}

interface WineAccordionSectionProps {
  id: string;
  setSectionRef: (id: string, node: HTMLElement | null) => void;
  children: ReactNode;
}

function WineAccordionSection({ id, setSectionRef, children }: WineAccordionSectionProps) {
  return (
    <div
      id={`wine-accordion-${id}`}
      ref={(node) => setSectionRef(id, node)}
      className="wine-accordion-section [overflow-anchor:none]"
    >
      {children}
    </div>
  );
}

interface BistrotWineCategoriesAccordionProps {
  categories: PublishedCategoryWithItems[];
  typography: MenuTypography;
  expandAll?: boolean;
  forceMountPanels?: boolean;
}

export function BistrotWineCategoriesAccordion({
  categories,
  typography,
  expandAll = false,
  forceMountPanels = false,
}: BistrotWineCategoriesAccordionProps) {
  const [openId, setOpenId] = useState<string>("");
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const productStyle = fontFamilyStyle(typography.productFont, "sans-serif");
  const priceStyle = fontFamilyStyle(typography.priceFont, "sans-serif");
  const ingredientStyle = {
    ...fontFamilyStyle(BISTROT_DISH_INGREDIENT_FONT, "sans-serif"),
    fontWeight: 400,
  };
  const reducedMotion = prefersReducedMotion();

  const visibleCategories = useMemo(
    () =>
      categories
        .map((category) => {
          const baseItems = (category.wineItems ?? []).filter((item) => item.visible);
          const sortByPrice = Boolean(category.wineSortByPrice);
          const items = sortByPrice ? sortWineItemsByPriceAsc(baseItems) : baseItems;
          return { category, items, sortByPrice };
        })
        .filter((entry) => entry.items.length > 0),
    [categories]
  );

  const expandedIds = useMemo(
    () => visibleCategories.map((entry) => entry.category.id),
    [visibleCategories]
  );

  const setSectionRef = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      sectionRefs.current.set(id, node);
      return;
    }
    sectionRefs.current.delete(id);
  }, []);

  const handleValueChange = useCallback(
    (value: string | undefined) => {
      const next = value ?? "";
      setOpenId(next);

      if (!next) return;

      const section = sectionRefs.current.get(next);
      if (!section) return;

      const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
      requestAnimationFrame(() => {
        pinAccordionSectionToTop(section, behavior);
      });
    },
    [reducedMotion]
  );

  return (
    <Accordion.Root
      {...(expandAll
        ? { type: "multiple" as const, value: expandedIds }
        : {
            type: "single" as const,
            collapsible: true as const,
            value: openId,
            onValueChange: handleValueChange,
          })}
    >
      {visibleCategories.map(({ category, items, sortByPrice }) => {
        const open = expandAll || openId === category.id;
        const isColored = hasCategoryAppearance(category);
        const hasFooter = Boolean(category.footerImageUrl);

        return (
          <WineAccordionSection
            key={category.id}
            id={category.id}
            setSectionRef={setSectionRef}
          >
            <Accordion.Item value={category.id} className="border-0">
              <CategorySection
                category={category}
                collapsed={false}
                hideFooter={hasFooter}
                className={cn(
                  hasFooter && MENU_PRINT_CATEGORY_HAS_FOOTER_CLASS,
                  isColored && category.textColor && CATEGORY_THEMED_CLASS
                )}
              >
                <WineAccordionTrigger
                  id={category.id}
                  isOpen={open}
                  className="mb-0"
                >
                  <BistrotCategoryHeading
                    as="h3"
                    name={category.name}
                    textColor={category.textColor}
                    fillColor={category.backgroundColor}
                    className="mb-0 text-center"
                  />
                </WineAccordionTrigger>

                <Accordion.Content
                  forceMount={expandAll || forceMountPanels || undefined}
                  className={cn(
                    WINE_ACCORDION_CONTENT_CLASS,
                    "wine-accordion-panel-radix"
                  )}
                  style={
                    reducedMotion
                      ? undefined
                      : {
                          // Durations come from CSS (open slower, close faster)
                          animationTimingFunction: WINE_ACCORDION_EASING,
                        }
                  }
                >
                  <div className="pt-10">
                    <WineCategoryList
                      items={items}
                      productStyle={productStyle}
                      priceStyle={priceStyle}
                      ingredientStyle={ingredientStyle}
                      colored={isColored}
                      groupBySubcategory={!sortByPrice}
                    />
                    {hasFooter && <CategorySectionFooter category={category} />}
                  </div>
                </Accordion.Content>
              </CategorySection>
            </Accordion.Item>
          </WineAccordionSection>
        );
      })}
    </Accordion.Root>
  );
}

interface ClassicWineCategoriesAccordionProps {
  categories: PublishedCategoryWithItems[];
  typography: MenuTypography;
  expandAll?: boolean;
  forceMountPanels?: boolean;
}

export function ClassicWineCategoriesAccordion({
  categories,
  typography,
  expandAll = false,
  forceMountPanels = false,
}: ClassicWineCategoriesAccordionProps) {
  const [openId, setOpenId] = useState<string>("");
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const categoryStyle = fontFamilyStyle(typography.categoryFont, "serif");
  const productStyle = fontFamilyStyle(typography.productFont, "sans-serif");
  const priceStyle = fontFamilyStyle(typography.priceFont, "sans-serif");
  const reducedMotion = prefersReducedMotion();

  const visibleCategories = useMemo(
    () =>
      categories
        .map((category) => {
          const baseItems = (category.wineItems ?? []).filter((item) => item.visible);
          const sortByPrice = Boolean(category.wineSortByPrice);
          const items = sortByPrice ? sortWineItemsByPriceAsc(baseItems) : baseItems;
          return { category, items, sortByPrice };
        })
        .filter((entry) => entry.items.length > 0),
    [categories]
  );

  const expandedIds = useMemo(
    () => visibleCategories.map((entry) => entry.category.id),
    [visibleCategories]
  );

  const setSectionRef = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      sectionRefs.current.set(id, node);
      return;
    }
    sectionRefs.current.delete(id);
  }, []);

  const handleValueChange = useCallback(
    (value: string | undefined) => {
      const next = value ?? "";
      setOpenId(next);

      if (!next) return;

      const section = sectionRefs.current.get(next);
      if (!section) return;

      const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
      requestAnimationFrame(() => {
        pinAccordionSectionToTop(section, behavior);
      });
    },
    [reducedMotion]
  );

  return (
    <Accordion.Root
      {...(expandAll
        ? { type: "multiple" as const, value: expandedIds }
        : {
            type: "single" as const,
            collapsible: true as const,
            value: openId,
            onValueChange: handleValueChange,
          })}
      className="w-full"
    >
      {visibleCategories.map(({ category, items, sortByPrice }) => {
        const open = expandAll || openId === category.id;
        const hasFooter = Boolean(category.footerImageUrl);

        return (
          <WineAccordionSection
            key={category.id}
            id={category.id}
            setSectionRef={setSectionRef}
          >
            <Accordion.Item value={category.id} className="border-0">
              <CategorySection
                category={category}
                collapsed={false}
                hideFooter={hasFooter}
              >
                <WineAccordionTrigger
                  id={category.id}
                  isOpen={open}
                  className="mb-0"
                >
                  <h2 className={cn(classicT.category, "mb-0 text-center")} style={categoryStyle}>
                    {category.name}
                  </h2>
                </WineAccordionTrigger>

                <Accordion.Content
                  forceMount={expandAll || forceMountPanels || undefined}
                  className={cn(
                    WINE_ACCORDION_CONTENT_CLASS,
                    "wine-accordion-panel-radix"
                  )}
                  style={
                    reducedMotion
                      ? undefined
                      : {
                          // Durations come from CSS (open slower, close faster)
                          animationTimingFunction: WINE_ACCORDION_EASING,
                        }
                  }
                >
                  <div className="space-y-5 pt-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border-b border-neutral-100 pb-4 last:border-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={classicT.itemName} style={productStyle}>
                              {item.name}
                            </h3>
                            {sortByPrice && item.subcategory?.trim() && (
                              <p className="mt-0.5 text-sm text-neutral-500">
                                {item.subcategory.trim()}
                              </p>
                            )}
                            <p className={classicT.itemMeta}>
                              {[item.producer, item.vintage]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            {item.description && (
                              <p className={classicT.itemDescriptionMuted}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className={classicT.priceColumn} style={priceStyle}>
                            {item.glassPrice && (
                              <div className={classicT.priceGlass}>
                                Calice {formatPrice(item.glassPrice)}
                              </div>
                            )}
                            {item.bottlePrice && (
                              <div className={classicT.priceBottle}>
                                {formatPrice(item.bottlePrice)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {hasFooter && <CategorySectionFooter category={category} />}
                  </div>
                </Accordion.Content>
              </CategorySection>
            </Accordion.Item>
          </WineAccordionSection>
        );
      })}
    </Accordion.Root>
  );
}
