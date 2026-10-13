import { SignupForm } from "@/components/auth/signup-form";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const metadata = {
  title: "Create Account | SubCore",
  description: "Create a new SubCore account to access the enterprise SaaS infrastructure.",
};

export default async function SignupPage() {
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

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-50 dark:bg-transparent px-6 py-12 lg:px-8 transition-colors">
      <SignupForm />
    </div>
  );
}