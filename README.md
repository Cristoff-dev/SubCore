# SubCore - Enterprise Telemetry & Infrastructure Monitoring SaaS

SubCore is a production-ready, highly scalable Software as a Service (SaaS) platform engineered to provide real-time telemetry and uptime tracking. Designed to meet the stringent demands of modern digital agencies, the system delivers automated infrastructure monitoring, instantaneous incident alerting, and seamless subscription management through a high-performance Next.js and PostgreSQL architecture.

## System Architecture & Technical Stack

* **Frontend Ecosystem:** Next.js 14 (App Router), React 18, Tailwind CSS, Tremor, and Framer Motion for data-dense, responsive, and highly interactive user interfaces.
* **Database & ORM:** PostgreSQL managed via Prisma ORM (@prisma/adapter-pg) with connection pooling, utilizing Supabase for highly available cloud data storage.
* **Authentication & Security:** Supabase Auth integrated via Server-Side Rendering (SSR), enforcing strict protected API routes and secure session lifecycle management.
* **Billing Infrastructure:** Deep Stripe API integration covering Checkout sessions, Customer Billing Portals, and secure cryptographic Webhook processing for automated subscription state synchronization.
* **Telemetry Engine:** Automated Cron-triggered background jobs executing concurrent HTTP polling via AbortControllers, coupled with the Resend API for low-latency transactional notifications.
* **DevOps & CI/CD:** GitHub Actions pipeline enforcing strict TypeScript compilation, package integrity (pnpm v9), and Next.js optimized production builds.

## Core Capabilities

* **Distributed Polling:** Concurrent target resolution with automated latency calculation, HTTP status validation, and degradation detection.
* **Automated Incident Response:** Real-time email dispatch utilizing Resend when infrastructure anomalies or service recoveries are detected.
* **Secure Webhook Processing:** Idempotent Stripe webhook handlers ensuring precise database synchronization for subscription lifecycles, upgrades, and cancellations.
* **B2B Multi-Tier Architecture:** Integrated tier-based access control natively tied to Stripe product schemas and Supabase user identities.

## Environment Configuration

The application enforces a strict environment schema. A `.env` file must be provisioned at the root directory with the following critical integration keys:

* `DATABASE_URL` / `DIRECT_URL` (PostgreSQL connection strings)
* `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Auth & Storage)
* `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` (Billing & Events)
* `NEXT_PUBLIC_STRIPE_HOBBY_PLAN_ID` / `NEXT_PUBLIC_STRIPE_PRO_PLAN_ID` (Product Tiers)
* `RESEND_API_KEY` (Transactional Emails)
* `CRON_SECRET` (Telemetry Authorization)

## Local Bootstrapping

1. Clone the repository and navigate to the project root:
   git clone https://github.com/Cristoff-dev/SubCore.git
   cd SubCore

2. Install dependencies via pnpm:
   pnpm install

3. Synchronize the database schema and generate the Prisma client:
   pnpm exec prisma db push
   pnpm exec prisma generate

4. Initialize the local development server:
   pnpm dev

## Contact & Integration

Available for enterprise integration, custom B2B deployments, and infrastructure consultation.
