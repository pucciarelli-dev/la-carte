export { middlewareAuth as default } from "@/lib/auth.middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
