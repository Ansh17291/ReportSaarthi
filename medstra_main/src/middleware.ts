import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  // "/assessment",
  "/about",
  "/contact",
  "/how-it-works",
  "/diagnostics",
  "/diagnostics/assessment",
  "/diagnostics/assessment/select",
  "/doctor/sign-in(.*)",
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
