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
    "/sign-up"
  ],
  ignoredRoutes: [
    "/api/webhook",
    "/api/products",
    "/api/categories"
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 