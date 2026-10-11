import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ThemeToggle } from "../themes";

async function signOut() {
  "use server";
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );
  
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout'); 
  
  redirect("/login");
}

export async function Navbar() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-8">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Sub<span className="text-indigo-600 dark:text-indigo-400">Core</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
            )}
            <Link href="/pricing" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Pricing
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-sm shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800 flex items-center justify-center">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block truncate max-w-[200px]">
                  {user.email}
                </span>
              </div>

              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block" aria-hidden="true" />

              <form action={signOut}>
                <button type="submit" className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/signup" className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}