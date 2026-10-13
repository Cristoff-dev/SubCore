"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signup } from "@/app/(auth)/login/actions";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type FormState = {
  error: string | null;
};

const initialState: FormState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-white px-3 py-2 text-sm font-semibold leading-6 text-white dark:text-black shadow-sm hover:bg-indigo-500 dark:hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signup, initialState);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const displayError = state?.error || oauthError;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });

    if (error) {
      setOauthError(error.message);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8 bg-white dark:bg-[#111111] p-8 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10 transition-colors">
      <div className="text-center">
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Join SubCore to manage your infrastructure.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200" htmlFor="email">
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white bg-transparent shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200" htmlFor="password">
            Password
          </label>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white bg-transparent shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="mt-2">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white bg-transparent shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 transition-colors"
            />
          </div>
        </div>

        {displayError && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{displayError}</p>
          </div>
        )}

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200 dark:border-gray-800 transition-colors" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white dark:bg-[#111111] px-6 text-gray-900 dark:text-gray-400 transition-colors">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-md bg-white dark:bg-[#111111] px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus-visible:ring-transparent transition-colors"
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
            <span className="text-sm font-semibold leading-6">Google</span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
          Sign In
        </Link>
      </p>
    </div>
  );
}