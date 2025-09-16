import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// const locales = ["en", "am"];
// const defaultLocale = "en";

export default auth((request) => {
  // The `auth` function will handle authentication.
  // If the user is not authenticated and tries to access a protected route,
  // it will automatically redirect them to the sign-in page.
  // The code below will only run for authorized requests or public pages.

  // const { pathname } = request.nextUrl;

  // // Get the preferred locale from the cookie, defaulting to 'en'
  // const cookieLocale =
  //   request.cookies.get("NEXT_LOCALE")?.value || defaultLocale;

  // // Check if the pathname already has a supported locale prefix
  // const pathnameHasLocale = locales.some(
  //   (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  // );

  // if (pathnameHasLocale) {
  //   const currentPathLocale = pathname.split("/")[1];

  //   // If the URL's locale is different from the cookie's locale, redirect
  //   if (currentPathLocale !== cookieLocale) {
  //     const newPathname = pathname.replace(
  //       `/${currentPathLocale}`,
  //       `/${cookieLocale}`
  //     );
  //     return NextResponse.redirect(new URL(newPathname, request.url));
  //   }
  // } else {
  //   // If the path has no locale, redirect to the one from the cookie
  //   request.nextUrl.pathname = `/${cookieLocale}${pathname}`;
  //   return NextResponse.redirect(request.nextUrl);
  // }

  // If no redirection is needed, continue to the requested page
  return NextResponse.next();
});

export const config = {
  // The matcher ensures the middleware runs on all paths except for specific ones.
  // next-auth automatically excludes its own /api/auth/** routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
