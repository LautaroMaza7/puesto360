import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Rutas públicas que no requieren autenticación
  publicRoutes: [
    "/",
    "/shop",
    "/api/webhook",
    "/api/products",
    "/api/categories",
    "/product/:path*",
    "/category/:path*"
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 