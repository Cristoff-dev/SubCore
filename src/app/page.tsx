"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Server, Shield } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-900/20 dark:via-[#0a0a0a] dark:to-[#0a0a0a] transition-colors duration-300"></div>
          
          <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 ring-1 ring-inset ring-indigo-100 dark:ring-indigo-500/20 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              SubCore Telemetry Engine v2.0 is live
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 transition-colors">
              Monitor your infrastructure <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                with absolute precision.
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 transition-colors">
              Enterprise-grade uptime monitoring, network telemetry, and instant incident response. Built for modern DevOps teams and system administrators.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all hover:scale-105"
              >
                Start Monitoring Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-[#111111] px-8 py-4 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                View Enterprise Plans
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Engineered for reliability</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 transition-colors">Everything you need to keep your services online and your customers happy.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-[#111111] p-8 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10 transition-colors">
                  <div className="h-12 w-12 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 transition-colors">
                    <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const features = [
  {
    title: "Real-time Telemetry",
    description: "Sub-second polling intervals with historical latency graphs powered by our proprietary Edge Network.",
    icon: Zap,
  },
  {
    title: "Global Infrastructure",
    description: "Monitor your APIs, HTTP endpoints, and internal routers from multiple geographic locations.",
    icon: Server,
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption, role-based access control, and compliant with modern security standards.",
    icon: Shield,
  },
];