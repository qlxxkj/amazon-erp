// app/(auth)/signup/confirm-email/page.tsx
import React from 'react';

export const metadata = {
    title: 'Check your email',
    description: 'We sent a confirmation link to your email',
};

export default function ConfirmEmailPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-xl rounded-lg bg-white p-8 shadow">
                <h1 className="text-2xl font-semibold mb-4">Check your email</h1>
                <p className="mb-6 text-gray-700">
                    We&apos;ve sent a confirmation link to the email address you provided. Please open your email and follow
                    the instructions to verify your account.
                </p>

                <ul className="mb-6 list-disc pl-5 text-gray-600">
                    <li>Check your inbox and also the spam/junk folder if you don&apos;t see the message.</li>
                    <li>The confirmation link may expire — if it does, please request a new confirmation from the sign-in page.</li>
                    <li>Once confirmed, you can sign in and will be redirected to your dashboard.</li>
                </ul>

                <div className="flex gap-3">
                    <a
                        href="/login"
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Go to Login
                    </a>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        </main>
    );
}