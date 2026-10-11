"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const tiers = [
  {
    name: "Hobby",
    id: "tier-hobby",
    priceMonthly: "$9",
    description: "Perfect for indie hackers and small side projects.",
    features: ["Up to 5 projects", "Basic analytics", "Community support"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_HOBBY_PLAN_ID, 
  },
  {
    name: "Pro",
    id: "tier-pro",
    priceMonthly: "$29",
    description: "For startups and agencies scaling their infrastructure.",
    features: ["Unlimited projects", "Advanced analytics", "24/7 Priority support", "Custom webhooks"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID,
    mostPopular: true,
  },
];

export function PricingTable() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubscribe = async (priceId: string | undefined) => {
    if (!priceId) {
      console.error("[SubCore] Missing Stripe Price ID in environment variables.");
      alert("Billing configuration error. Please contact support.");
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/signup");
      return;
    }

    startTransition(async () => {
      try {
        await createCheckoutSession(priceId);
      } catch (error) {
        console.error("[SubCore] Checkout session initialization failed:", error);
        alert("Failed to initialize the checkout process. Please try again.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 transition-colors">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Pricing</h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Plans engineered to scale with you
        </p>
      </div>
      
      <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 lg:gap-y-0">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-3xl p-8 ring-1 xl:p-10 transition-colors ${
              tier.mostPopular 
                ? "bg-gray-900 dark:bg-[#111111] ring-gray-900 dark:ring-indigo-500/30 shadow-lg dark:shadow-indigo-500/10" 
                : "bg-white dark:bg-transparent ring-gray-200 dark:ring-white/10"
            }`}
          >
            <div className="flex items-center justify-between gap-x-4">
              <h3 className={`text-lg font-semibold leading-8 ${tier.mostPopular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {tier.name}
              </h3>
              {tier.mostPopular && (
                <p className="rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-400 dark:text-indigo-300">
                  Most popular
                </p>
              )}
            </div>
            <p className={`mt-4 text-sm leading-6 ${tier.mostPopular ? "text-gray-300 dark:text-gray-400" : "text-gray-600 dark:text-gray-400"}`}>
              {tier.description}
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className={`text-4xl font-bold tracking-tight ${tier.mostPopular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {tier.priceMonthly}
              </span>
              <span className={`text-sm font-semibold leading-6 ${tier.mostPopular ? "text-gray-300 dark:text-gray-400" : "text-gray-600 dark:text-gray-500"}`}>
                /month
              </span>
            </p>
            <button
              onClick={() => handleSubscribe(tier.priceId)}
              disabled={isPending}
              className={`mt-6 flex w-full items-center justify-center rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                tier.mostPopular
                  ? "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-indigo-500"
                  : "bg-indigo-600 dark:bg-white text-white dark:text-black hover:bg-indigo-500 dark:hover:bg-gray-200 focus-visible:outline-indigo-600"
              } disabled:opacity-50`}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Subscribe"}
            </button>
            <ul className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${tier.mostPopular ? "text-gray-300 dark:text-gray-400" : "text-gray-600 dark:text-gray-400"}`}>
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check className={`h-6 w-5 flex-none ${tier.mostPopular ? "text-indigo-400" : "text-indigo-600 dark:text-indigo-400"}`} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}