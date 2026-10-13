import { LoginForm } from "@/components/auth/login-form";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const metadata = {
  title: "Sign In | SubCore",
  description: "Sign in to your SubCore account to manage your infrastructure.",
};

export default async function LoginPage() {
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
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-50 dark:bg-transparent px-6 py-12 lg:px-8 transition-colors">
      <LoginForm />
    </main>
  );
}