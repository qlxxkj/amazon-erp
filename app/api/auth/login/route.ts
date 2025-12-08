// app/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient as createServerClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        const supabase = await createServerClient();
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }

        // 登录成功 — 服务器端 cookie 已由 server client 写入
        return NextResponse.json({ success: true, user: data.user ?? null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
    }
}