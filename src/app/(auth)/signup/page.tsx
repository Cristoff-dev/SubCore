import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create Account | SubCore",
  description: "Create a new SubCore account to access the enterprise SaaS infrastructure.",
};

export default function SignupPage() {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-50 dark:bg-transparent px-6 py-12 lg:px-8 transition-colors">
      <SignupForm />
    </div>
  );
}