/** Durata ed easing condivisi per tutte le animazioni UI */

export const MOTION_DURATION_MS = 300;
export const SHEET_DURATION_MS = 400;
export const SHEET_CLOSE_MS = SHEET_DURATION_MS;

const DURATION = "duration-300";
const EASE = "ease-in-out";

const motionEnter = (...effects: string[]) =>
  [
    "motion-safe:animate-in",
    "motion-safe:fade-in",
    ...effects,
    EASE,
    DURATION,
  ].join(" ");

export const pressable =
  "transition-transform duration-150 ease-out active:scale-95 motion-reduce:active:scale-100";

export const scaleIn = motionEnter("motion-safe:zoom-in-95");
export const pageEnter = motionEnter("motion-safe:slide-in-from-bottom-4");
export const toastEnter = motionEnter(
  "motion-safe:slide-in-from-bottom-2",
  "motion-safe:zoom-in-95"
);

export const editorCard =
  "transition-transform duration-300 ease-in-out hover:-translate-y-0.5 active:scale-[0.99] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100";

export const itemRowHover =
  "transition-[background-color,transform] duration-300 ease-in-out hover:translate-x-1 motion-reduce:hover:translate-x-0";

export const staggerChildren = [
  "[&>*]:motion-safe:animate-in",
  "[&>*]:motion-safe:fade-in",
  "[&>*]:motion-safe:slide-in-from-bottom-2",
  "[&>*]:duration-300",
  "[&>*]:ease-in-out",
  "[&>*:nth-child(1)]:delay-0",
  "[&>*:nth-child(2)]:delay-75",
  "[&>*:nth-child(3)]:delay-150",
  "[&>*:nth-child(4)]:delay-200",
  "[&>*:nth-child(5)]:delay-300",
  "[&>*:nth-child(n+6)]:delay-300",
].join(" ");

/** tw-animate: Radix tiene il DOM montato in chiusura, le transizioni CSS non bastano */
const sheetMotionTiming = [
  "motion-safe:data-[state=open]:duration-[400ms]",
  "motion-safe:data-[state=closed]:duration-[400ms]",
  "motion-safe:ease-in-out",
].join(" ");

export const sheetOverlayMotion = [
  "motion-safe:data-[state=open]:animate-in",
  "motion-safe:data-[state=closed]:animate-out",
  "motion-safe:data-[state=open]:fade-in-0",
  "motion-safe:data-[state=closed]:fade-out-0",
  sheetMotionTiming,
].join(" ");

export const sheetContentMotion = [
  "motion-safe:data-[state=open]:animate-in",
  "motion-safe:data-[state=closed]:animate-out",
  "motion-safe:data-[state=open]:slide-in-from-right",
  "motion-safe:data-[state=closed]:slide-out-to-right",
  sheetMotionTiming,
].join(" ");

export const navLinkBase = [
  "group relative flex items-center gap-3 rounded-lg py-2 pr-3 pl-3 text-sm",
  "transition-[background-color,color,transform]",
  DURATION,
  EASE,
  "hover:translate-x-0.5",
  "motion-reduce:hover:translate-x-0",
].join(" ");

export const navLinkActive =
  "translate-x-0 font-medium before:absolute before:top-1/2 before:left-0 before:h-[60%] before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary before:content-['']";

export const navIcon = [
  "h-4 w-4 shrink-0 transition-transform",
  DURATION,
  EASE,
  "group-hover:scale-110",
  "motion-reduce:group-hover:scale-100",
].join(" ");
