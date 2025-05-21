import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // If the user is not authenticated and trying to access a protected dashboard route
  // (excluding admin login, signup, etc.), redirect to the main dashboard login.
  // Ballot voting pages (e.g., /ballot/[id]/vote) are handled separately and are not under /dashboard.
  if (
    !user &&
    pathname.startsWith("/dashboard") &&
    // !pathname.startsWith("/dashboard/ballot") && // No longer needed as ballot page moved
    !pathname.startsWith("/dashboard/login") &&
    !pathname.startsWith("/dashboard/signup") &&
    !pathname.startsWith("/dashboard/forgot-password") && 
    !pathname.startsWith("/dashboard/update-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/login"; // Admin/Organizer login
    return NextResponse.redirect(url);
  }

  // For ballot voting pages (e.g., /ballot/[id]/vote):
  // If the user is not authenticated, the page component itself will redirect
  // them to the specific voter login page (e.g., /ballot/[id]).
  // The Supabase middleware still runs on these paths (if matched by `config.matcher`)
  // to process magic link tokens if a token is present in the URL.

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
