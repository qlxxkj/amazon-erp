'use client';
import { useState } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get('email') ?? '');
        const password = String(formData.get('password') ?? '');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();

            if (!res.ok || json.success === false) {
                setErrorMsg(json.error ?? 'Login failed');
                setLoading(false);
                return;
            }

            // 登录成功：使用完整跳转，确保服务端渲染能读取到 cookie
            window.location.href = '/dashboard';
        } catch (err: any) {
            setErrorMsg(err?.message ?? 'Network error');
            setLoading(false);
        }
    };

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="flex-1 rounded-lg bg-gray-50 px-8 pb-4 pt-8">
                <h1 className={`${lusitana.className} mb-3 text-2xl`}>Please Log In to continue.</h1>

                {errorMsg && (
                    <div className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-700">
                        {errorMsg}
                    </div>
                )}

                <div className="w-full">
                    <div>
                        <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <input id="email" name="email" type="email" placeholder="Enter your email address" required className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" />
                            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input id="password" name="password" type="password" placeholder="Enter password" required minLength={6} className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" />
                            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                    </div>
                </div>

                <Button className="mt-4 w-full" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : (
                        <>
                            Log In <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                        </>
                    )}
                </Button>

                <div className="flex py-4 items-end space-x-4">
                    <p>Don't have an account? go to</p>
                    <p className="text-blue-500"><a href="/signup">Sign Up</a></p>
                </div>
            </div>
        </form>
    );
}