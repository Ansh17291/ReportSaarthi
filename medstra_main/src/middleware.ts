import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/how-it-works",
  "/assessment/select",
  "/sign-in",
  "/sign-up",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }
  auth.protect();
});

// Define which routes should trigger the middleware
export const config = {
  matcher: ["/((?!_next|api/public|.+\\.[\\w]+$).*)"],
};
