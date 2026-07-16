/** Scala tipografica del menu pubblico — leggibile su schermo */

export const classicMenuTypography = {
  category: "mb-6 text-center text-2xl uppercase tracking-[0.2em]",
  itemName: "text-lg font-medium tracking-[0.1em] text-neutral-900",
  itemMeta: "text-base text-neutral-500",
  itemDescription: "mt-1 text-base leading-relaxed text-neutral-500",
  itemDescriptionMuted: "mt-1 text-base leading-relaxed text-neutral-400",
  itemIngredients: "text-base italic text-neutral-500",
  price: "shrink-0 text-base font-medium tabular-nums text-neutral-900",
  priceColumn: "shrink-0 text-right text-sm tabular-nums",
  priceBottle: "font-medium text-base text-neutral-900",
  priceGlass: "text-sm text-neutral-600",
  badge: "text-xs text-neutral-500",
  legend: "border-t pt-8 text-sm leading-relaxed text-neutral-500",
  legendTitle:
    "mb-3 text-center text-base font-medium uppercase tracking-wider text-neutral-700",
} as const;

export const bistrotMenuTypography = {
  restaurantName:
    "m-0 text-sm leading-none font-light tracking-[0.62em] indent-[0.62em]",
  menuTitle:
    "mt-8 mb-0 font-serif text-3xl leading-tight font-light tracking-[0.42em] indent-[0.42em]",
  address:
    "mt-5 text-xs font-light tracking-[0.22em] text-[#5c5c5c] indent-[0.22em] uppercase",
  restaurantNameRepeat:
    "mt-10 text-xs font-light tracking-[0.55em] indent-[0.55em]",
  intro:
    "mx-auto mt-7 max-w-[34rem] text-center text-sm leading-[1.85] tracking-wide text-[#5c5c5c]",
  tagline:
    "mt-10 text-center text-xs font-light tracking-[0.38em] text-[#8a8a8a] indent-[0.38em]",
  categoryOutline:
    "bistrot-category-outline mb-10 text-center text-7xl font-normal uppercase leading-none tracking-[0.14em] sm:text-8xl",
  dishName:
    "m-0 min-w-0 text-sm font-bold uppercase leading-snug tracking-[0.12em] sm:text-base",
  dishDescription:
    "dish-muted text-xs font-normal uppercase leading-relaxed tracking-wide sm:text-sm",
  dishPrice:
    "shrink-0 text-lg font-light italic leading-none tabular-nums sm:text-xl",
  itemMeta:
    "mt-1 text-xs font-normal leading-relaxed tracking-wide text-[#5c5c5c] sm:text-sm",
  itemDescriptionMuted:
    "mt-0.5 text-xs font-normal italic leading-relaxed tracking-wide text-[#8a8a8a] sm:text-sm",
  itemPriceGlass:
    "block text-sm font-light italic leading-none tabular-nums text-[#5c5c5c] sm:text-base",
  introEyebrow:
    "text-xs font-normal uppercase tracking-[0.42em] text-[#b8956b]",
  introHeroTitle:
    "bistrot-category-outline text-9xl font-normal uppercase leading-none tracking-[0.14em] sm:text-[10rem]",
  introHeroSubtitle:
    "mt-3 text-2xl font-normal uppercase tracking-[0.22em] text-white/95 sm:text-3xl",
  introHeroAddress:
    "text-xs font-bold uppercase tracking-[0.22em] text-white/90",
  introLogo:
    "mx-auto h-24 w-auto max-w-[min(100%,16rem)] object-contain sm:h-28 sm:max-w-[min(100%,20rem)]",
  introSectionTitle:
    "bistrot-category-outline text-7xl font-normal uppercase leading-none tracking-[0.14em] text-[#1c1c1c] sm:text-8xl",
  introBody:
    "mx-auto mt-8 max-w-[34rem] text-center text-sm font-normal leading-[1.85] tracking-wide text-[#5c5c5c]",
  introBodyImage:
    "my-12 w-full object-cover",
  introBodyImageTagline:
    "mt-6 text-center text-3xl font-bold uppercase tracking-[0.12em] text-[#1c1c1c] sm:text-4xl",
  footerName: "mb-7 text-xs tracking-[0.5em] indent-[0.5em]",
  footerNote: "my-1.5 text-xs leading-[1.7] tracking-wide text-[#5c5c5c]",
  footerSmall: "mt-6 text-xs tracking-widest text-[#8a8a8a]",
  legendTitle:
    "mb-3 text-center text-xs font-normal tracking-widest text-[#5c5c5c]",
  legendBody:
    "columns-1 gap-8 text-xs leading-[1.65] tracking-wide text-[#8a8a8a] min-[480px]:columns-2",
  legendDisclaimer:
    "mt-4 text-center text-xs tracking-wide text-[#8a8a8a] italic",
  headerRestaurant: "text-sm font-light tracking-[0.55em] text-neutral-800",
  headerTagline: "mt-6 text-xs font-light tracking-[0.35em] text-neutral-600",
  headerSubtitle:
    "mt-4 font-serif text-2xl font-normal tracking-[0.4em] text-neutral-900",
  headerAddress: "mt-3 text-xs tracking-[0.2em] text-neutral-500",
  wineItem: "mb-10 break-inside-avoid",
  wineItemName:
    "m-0 min-w-0 text-sm font-bold uppercase leading-snug tracking-[0.12em] text-[#1c1c1c] sm:text-base",
  wineMeta:
    "mt-1 text-xs font-normal leading-relaxed tracking-wide text-[#5c5c5c] sm:text-sm",
  wineDescription:
    "mt-0.5 text-xs font-normal uppercase leading-relaxed tracking-wide text-[#8a8a8a] sm:text-sm",
  wineFooter:
    "mt-8 border-t border-neutral-200 pt-6 text-center text-xs tracking-[0.15em] text-neutral-500",
  drinkMixer:
    "flex items-baseline justify-between gap-2 text-sm sm:text-base",
  drinkName:
    "m-0 min-w-0 text-sm font-bold uppercase leading-snug tracking-[0.12em] text-[#1c1c1c] sm:text-base",
  drinkMeta:
    "mt-1 text-xs font-normal leading-relaxed tracking-wide text-[#5c5c5c] sm:text-sm",
  drinkDescription:
    "mt-0.5 text-xs font-normal uppercase leading-relaxed tracking-wide text-[#8a8a8a] sm:text-sm",
  drinkPrice:
    "shrink-0 text-lg font-light italic leading-none tabular-nums text-[#1c1c1c] sm:text-xl",
  drinkFooter: "mt-12 text-center text-xs tracking-[0.15em] text-neutral-500",
  introFooterNote:
    "text-sm leading-[1.7] tracking-wide text-white/85",
  introFooterLegendTitle:
    "text-center text-xs font-normal tracking-widest text-white/90",
  introFooterLegendBody:
    "columns-1 gap-8 text-xs leading-[1.65] tracking-wide text-white/75 min-[480px]:columns-2",
  introFooterLegendDisclaimer:
    "mt-2 text-center text-xs tracking-wide text-white/60 italic",
  introFooterFrozenTitle:
    "text-center text-xs font-normal tracking-widest text-white/90",
  wineCategoryHeading:
    "mb-6 mt-10 text-center text-sm font-normal uppercase italic tracking-[0.35em] text-[#1c1c1c] sm:text-base",
  wineGrapes:
    "mt-1 pr-4 text-xs font-normal italic leading-relaxed tracking-wide text-[#5c5c5c] sm:text-sm",
  newsletterText:
    "mx-auto max-w-[34rem] text-sm leading-relaxed tracking-wide text-[#5c5c5c]",
  newsletterLink:
    "inline-block font-normal uppercase tracking-[0.12em] text-[#1c1c1c] underline decoration-[#1c1c1c]/35 underline-offset-4 transition hover:decoration-[#1c1c1c]",
} as const;

export const bistrotCategoryOutlineClass = bistrotMenuTypography.categoryOutline;
