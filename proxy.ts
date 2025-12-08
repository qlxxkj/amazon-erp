import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function proxy(request: Request) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = new URL(request.url);
    const pathname = url.pathname;

    // 未登录需要保护的路径
    const protectedRoutes = ["/dashboard", "/listings", "/settings"];

    const needAuth = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (needAuth && !user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}
