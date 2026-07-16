import { cn } from "@/lib/utils";
import { BISTROT_CATEGORY_DISPLAY_FONT, fontFamilyStyle } from "@/lib/google-fonts";
import { bistrotCategoryOutlineClass } from "@/lib/menu-typography";

interface BistrotCategoryHeadingProps {
  name: string;
  textColor?: string | null;
  fillColor?: string | null;
  as?: "h2" | "h3";
  className?: string;
}

export function BistrotCategoryHeading({
  name,
  textColor,
  fillColor,
  as: Tag = "h2",
  className,
}: BistrotCategoryHeadingProps) {
  const strokeColor = textColor ?? "#1c1c1c";
  const innerFill = fillColor ?? "#ffffff";

  return (
    <Tag
      className={cn(bistrotCategoryOutlineClass, className)}
      style={{
        ...fontFamilyStyle(BISTROT_CATEGORY_DISPLAY_FONT, "sans-serif"),
        color: innerFill,
        WebkitTextFillColor: innerFill,
        WebkitTextStroke: `2px ${strokeColor}`,
        paintOrder: "stroke fill",
        ["--bistrot-stroke-color" as string]: strokeColor,
        ["--bistrot-fill-color" as string]: innerFill,
      }}
    >
      {name.toUpperCase()}
    </Tag>
  );
}
