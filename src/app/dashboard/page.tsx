import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { CreateMonitorModal } from "@/components/monitors/CreateMonitorModal";
import { createCustomerPortalSession } from "@/app/dashboard/actions";
import { MonitorList } from "@/components/monitors/MonitorList";
import { AutoRefresh } from "@/components/AutoRefresh";
import { ExternalLink } from "lucide-react";

export default async function DashboardPage() {
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

  if (!user) {
    redirect("/login");
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const hasAccess = subscription && (subscription.status === 'active' || subscription.status === 'past_due');

  let customerId = "";
  if (hasAccess && subscription?.stripeSubscriptionId) {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    customerId = stripeSubscription.customer as string;
  }

  const manageSubscription = createCustomerPortalSession.bind(null, customerId);

  return (
    <main className="p-8 max-w-5xl mx-auto flex-1 w-full">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Client Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Welcome back, <span className="font-medium text-gray-900 dark:text-gray-200">{user.email}</span>.
          </p>
        </div>

        {hasAccess && <CreateMonitorModal />}
      </header>

      {!hasAccess ? (
        <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-8 text-center transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active subscription</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You currently don't have an active plan. Choose a subscription to unlock all enterprise features and manage your infrastructure.
          </p>
          <Link
            href="/pricing"
            className="inline-flex justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            View Pricing Plans
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
           <div className="p-6 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#111111] shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Next Billing Date</h2>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">Status: {subscription.status}</p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <form action={manageSubscription}>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-gray-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-black shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Manage Subscription
                  </button>
                </form>
                
                <Link
                  href={`/status/${user.id}`}
                  target="_blank"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white dark:bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Public Status Page
                </Link>
              </div>
            </div>
          </div>
          <AutoRefresh intervalMs={5000} />
          <MonitorList />
        </>
      )}
    </main>
  );
}