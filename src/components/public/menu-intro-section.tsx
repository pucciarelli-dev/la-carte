import type { MenuType } from "@prisma/client";
import type { MenuIntro } from "@/lib/menu-intro";
import { normalizeMenuIntro, getIntroTextSectionContent, shouldShowIntroTextSection } from "@/lib/menu-intro";
import type { TenantBranding } from "@/lib/layouts";
import { DEFAULT_MENU_SUBTITLES } from "@/lib/layouts";
import { fontFamilyStyle, BISTROT_CATEGORY_DISPLAY_FONT, BISTROT_INTRO_BODY_FONT } from "@/lib/google-fonts";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";
import { cn, spacedTitle } from "@/lib/utils";
import { MenuIntroLogo } from "@/components/public/menu-intro-logo";
import {
  MENU_PRINT_PAGE_COVER_CLASS,
  MENU_PRINT_PAGE_SECTION_CLASS,
  MENU_PRINT_PAGE_INNER_CLASS,
} from "@/lib/menu-print";
import { CATEGORY_BAND_CONTENT_CLASS, CATEGORY_BAND_INNER_CLASS } from "@/lib/category-styles";

interface MenuIntroSectionProps {
  intro?: MenuIntro | null;
  branding: TenantBranding;
  menuType: MenuType;
  subtitle?: string | null;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  className?: string;
}

function OutlineTitle({
  text,
  className,
  strokeColor,
  fillColor,
}: {
  text: string;
  className?: string;
  strokeColor: string;
  fillColor: string;
}) {
  return (
    <h2
      className={cn("bistrot-outline-title", className)}
      style={{
        ...fontFamilyStyle(BISTROT_CATEGORY_DISPLAY_FONT, "sans-serif"),
        color: fillColor,
        WebkitTextFillColor: fillColor,
        WebkitTextStroke: `2px ${strokeColor}`,
        paintOrder: "stroke fill",
        ["--bistrot-stroke-color" as string]: strokeColor,
        ["--bistrot-fill-color" as string]: fillColor,
      }}
    >
      {text.toUpperCase()}
    </h2>
  );
}

export function MenuIntroSection({
  intro,
  branding,
  menuType,
  subtitle,
  coverImageUrl,
  coverVideoUrl,
  className,
}: MenuIntroSectionProps) {
  const data = normalizeMenuIntro(intro, branding, menuType, subtitle);
  const textSection = getIntroTextSectionContent(intro);
  const heroSubtitle = subtitle ?? DEFAULT_MENU_SUBTITLES[menuType];
  const hasCover = Boolean(coverImageUrl || coverVideoUrl);
  const coverVideoOnly = Boolean(coverVideoUrl && !coverImageUrl);
  const showTextSection = shouldShowIntroTextSection(intro);
  const sectionTitleLines = (textSection.sectionTitle ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const introBodyStyle = {
    ...fontFamilyStyle(BISTROT_INTRO_BODY_FONT, "sans-serif"),
    fontWeight: 400,
  };
  const introTaglineStyle = {
    ...fontFamilyStyle(BISTROT_CATEGORY_DISPLAY_FONT, "sans-serif"),
    fontWeight: 700,
  };
  const heroSubtitleStyle = fontFamilyStyle(
    BISTROT_CATEGORY_DISPLAY_FONT,
    "sans-serif"
  );
  const heroAddressStyle = {
    ...fontFamilyStyle(BISTROT_INTRO_BODY_FONT, "sans-serif"),
    fontWeight: 700,
  };

  return (
    <div className={cn("menu-intro-wrapper mb-10 print:mb-0", className)}>
      {hasCover && (
        <div
          className={cn(
            MENU_PRINT_PAGE_COVER_CLASS,
            "menu-full-bleed menu-intro-cover relative left-1/2 mb-0 w-screen max-w-[100vw] -translate-x-1/2"
          )}
        >
          <div className="menu-intro-cover-media relative h-screen max-h-screen w-full overflow-hidden bg-neutral-900">
          {coverVideoUrl ? (
            <>
              <video
                className={cn(
                  "menu-intro-cover-video block h-full w-full object-cover object-center",
                  coverVideoOnly && "menu-intro-cover-video-only"
                )}
                src={coverVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
              {coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="menu-intro-cover-poster hidden h-full w-full object-cover object-center"
                  src={coverImageUrl}
                  alt=""
                  decoding="async"
                  fetchPriority="high"
                />
              ) : null}
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="menu-intro-cover-image block h-full w-full object-cover object-center"
              src={coverImageUrl!}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/72"
            aria-hidden
          />
          <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-10 text-center text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)] sm:py-12 pt-8">
            <div className="space-y-3">
              {data.logoUrl && (
                <MenuIntroLogo logoUrl={data.logoUrl} inverted />
              )}
            </div>

            <div>
              {data.heroTitle && (
                <OutlineTitle
                  text={data.heroTitle}
                  className={cn(t.introHeroTitle, "text-white")}
                  strokeColor="#ffffff"
                  fillColor="transparent"
                />
              )}
              {heroSubtitle && (
                <p className={t.introHeroSubtitle} style={heroSubtitleStyle}>
                  {spacedTitle(heroSubtitle)}
                </p>
              )}
            </div>

            {data.address && (
              <p className={t.introHeroAddress} style={heroAddressStyle}>
                {data.address}
              </p>
            )}
          </div>
          </div>
        </div>
      )}

      {showTextSection && (
      <section
        className={cn(
          MENU_PRINT_PAGE_SECTION_CLASS,
          CATEGORY_BAND_CONTENT_CLASS,
          "menu-intro-text-section py-12 sm:py-14"
        )}
      >
        <div className={cn(MENU_PRINT_PAGE_INNER_CLASS, CATEGORY_BAND_INNER_CLASS, "text-center")}>
        {(textSection.sectionLogoUrl || data.logoUrl) && (
          <MenuIntroLogo
            logoUrl={textSection.sectionLogoUrl ?? data.logoUrl}
            className="mb-8"
          />
        )}

        {sectionTitleLines.length > 0 && (
          <div className="space-y-1 py-6 sm:py-8">
            {sectionTitleLines.map((line) => (
              <OutlineTitle
                key={line}
                text={line}
                className={t.introSectionTitle}
                strokeColor="#1c1c1c"
                fillColor="#ffffff"
              />
            ))}
          </div>
        )}

        {textSection.bodyText && (
          <p className={t.introBody} style={introBodyStyle}>
            {textSection.bodyText}
          </p>
        )}
        {textSection.bodyImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={textSection.bodyImageUrl}
            alt=""
            loading="eager"
            decoding="async"
            className={cn("menu-section-image", t.introBodyImage)}
          />
        )}
        {textSection.bodyImageTagline && (
          <p className={t.introBodyImageTagline} style={introTaglineStyle}>
            {textSection.bodyImageTagline.toUpperCase()}
          </p>
        )}
        {textSection.bodyTextSecondary && (
          <p className={cn(t.introBody, "mt-5")} style={introBodyStyle}>
            {textSection.bodyTextSecondary}
          </p>
        )}
        </div>
      </section>
      )}
    </div>
  );
}
