// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

// 浏览器端创建 Supabase client（用于客户端交互）
export function createBrowserSupabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}