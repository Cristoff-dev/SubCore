import { PricingTable } from "@/components/pricing-table";

export const metadata = {
  title: "Pricing | SubCore",
  description: "Transparent pricing for scalable SaaS infrastructure.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12">
      <PricingTable />
    </main>
  );
}