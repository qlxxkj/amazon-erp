'use server'

import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import Logo from '@/app/ui/logo';
import { PowerIcon } from '@heroicons/react/24/outline';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/utils/supabase/server'; // your async-version

export async function signOutAction() {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.error('server signOut error', error);
    // Redirect to login (or return a response)
    return redirect('/login');
}

export default async function SideNav() {
  return (
      <div className="flex h-full flex-col px-3 py-4 md:px-2 shadow-md">
      <Link
        className="mb-2 flex h-20 items-center justify-start rounded-md p-4 md:h-20"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <Logo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        <form action={signOutAction}>
          <button type='submit' className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
