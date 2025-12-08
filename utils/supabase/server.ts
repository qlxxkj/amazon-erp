// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

/**
 * 在 Server Components / Server Actions 中调用该函数以创建一个带 cookie 适配器的 Supabase server client。
 * 兼容 Next 16 的 cookies()（可能为同步或异步）。
 */
export async function createServerSupabaseClient() {
    // nextCookies() 在运行时返回 RequestCookies (在某些版本中为同步对象)
    let cookieStore;
    try {
        cookieStore = await nextCookies();
    } catch (err) {
        // cookies() 可能在某些上下文不可用，确保不抛出
        // 仅记录简短信息，避免泄露敏感数据
        // eslint-disable-next-line no-console
        console.error('utils/supabase/server: cookies() unavailable', (err as Error)?.message ?? err);
        cookieStore = undefined;
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    try {
                        // RequestCookies 提供 getAll()，返回 Cookie[]
                        const all = (cookieStore as any)?.getAll?.();
                        if (!Array.isArray(all)) return [];
                        return all;
                    } catch (err) {
                        // 记录简短错误信息并返回空数组，避免抛出
                        // eslint-disable-next-line no-console
                        console.error('utils/supabase/server: cookies.getAll() error', (err as Error)?.message ?? err);
                        return [];
                    }
                },
                setAll(cookiesToSet) {
                    // 在 Server Components 中，cookieStore.set 可能不可用（只在 route handlers / middleware 可写）。
                    // 因此使用 try/catch，并且不抛出以免阻断渲染。
                    try {
                        if (!cookieStore) return;
                        if (typeof (cookieStore as any).set !== 'function') return;

                        cookiesToSet.forEach(({ name, value, options }) => {
                            try {
                                (cookieStore as any).set?.(name, value, options);
                            } catch (innerErr) {
                                // 单个 cookie 设置失败时记录并继续设置其它 cookie
                                // eslint-disable-next-line no-console
                                console.error(`utils/supabase/server: failed to set cookie ${name}`, (innerErr as Error)?.message ?? innerErr);
                            }
                        });
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error('utils/supabase/server: cookies.setAll() error', (err as Error)?.message ?? err);
                    }
                },
            },
        }
    );
}