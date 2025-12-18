import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // check if authenticated
  // if not redirect to /login
  // return NextResponse.redirect(new URL("/home", request.url));
}

export const config = {
  matcher: ["/profile:path*", "/video:path*", "/search"],
};
