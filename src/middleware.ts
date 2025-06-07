import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Rutas públicas que no requieren autenticación
  publicRoutes: [
    "/",
    "/cart",
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
  ],
  afterAuth(auth, req, evt) {
    // Si el usuario no está autenticado y está intentando acceder a una ruta protegida
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 