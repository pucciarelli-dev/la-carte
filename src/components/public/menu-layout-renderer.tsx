import type { MenuLayout } from "@prisma/client";
import type { MenuRenderContext } from "@/lib/layouts";
import { ClassicLayout } from "@/components/public/layouts/classic-layout";
import { BistrotDinnerLayout } from "@/components/public/layouts/bistrot-dinner-layout";
import { BistrotWineLayout } from "@/components/public/layouts/bistrot-wine-layout";
import { BistrotDrinkLayout } from "@/components/public/layouts/bistrot-drink-layout";

const LAYOUT_COMPONENTS: Record<
  MenuLayout,
  React.ComponentType<MenuRenderContext>
> = {
  CLASSIC: ClassicLayout,
  BISTROT_DINNER: BistrotDinnerLayout,
  BISTROT_WINE: BistrotWineLayout,
  BISTROT_DRINK: BistrotDrinkLayout,
};

interface MenuLayoutRendererProps extends MenuRenderContext {
  layout: MenuLayout;
}

export function MenuLayoutRenderer({
  layout,
  ...context
}: MenuLayoutRendererProps) {
  const Component = LAYOUT_COMPONENTS[layout] ?? ClassicLayout;
  return <Component {...context} />;
}
