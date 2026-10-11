import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In | SubCore",
  description: "Sign in to your SubCore account to manage your infrastructure.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-50 dark:bg-transparent px-6 py-12 lg:px-8 transition-colors">
      <LoginForm />
    </main>
  );
}