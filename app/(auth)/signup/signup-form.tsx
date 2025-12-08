// app/(auth)/signup/signup-form.tsx
'use server';

import { lusitana } from '@/app/ui/fonts';
import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button'; // 如有不同路径，请调整
import { redirect } from 'next/navigation';
import { createServerSupabaseClient as createServerClient } from '@/utils/supabase/server';

export async function registerAction(formData: FormData) {
    'use server';
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
        throw new Error('Email and password required');
    }

    const supabase = await createServerClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        throw new Error(error.message);
    }

    // 如果使用邮件确认流程，你可以 redirect 到 "check your email" 页面
    redirect('/signup/confirm-email');
}

export default async function SignUpForm() {
    return (
        <form className="space-y-3" action={registerAction}>
            <div className="flex-1 rounded-lg bg-gray-50 px-8 pb-4 pt-8">
                <h1 className={`${lusitana.className} mb-3 text-2xl`}>Please Sign Up to continue.</h1>

                <div className="w-full">
                    <div>
                        <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email address"
                                required
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                            />
                            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter password"
                                required
                                minLength={6}
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                            />
                            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                    </div>
                </div>

                <Button className="mt-4 w-full" type="submit">
                    Sign Up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                </Button>

                <div className="flex p-4 items-end space-x-4">
                    <p>Has an account ? go to</p>
                    <p className="text-blue-500"><a href="/login">Login In</a></p>
                </div>
            </div>
        </form>
    );
}