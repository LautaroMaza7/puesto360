import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Rutas públicas que no requieren autenticación
  publicRoutes: [
    "/",
    "/shop",
    "/api/webhook",
    "/api/products",
    "/api/categories",
    "/product/:path*",
    "/category/:path*",
    "/sign-in",
    "/sign-up",
    "/api/auth(.*)"
  ],
  ignoredRoutes: [
    "/api/webhook",
    "/api/products",
    "/api/categories",
    "/api/auth(.*)"
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 