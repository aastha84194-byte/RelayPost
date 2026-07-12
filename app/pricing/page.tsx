"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Check, X, Sparkles, Zap, Star, Shield,
  BookOpen, Brain, Search, BarChart2, Bookmark,
  Globe, ChevronDown,
} from "lucide-react";
import Cookies from "js-cookie";
import { useTier } from "@/components/TierProvider";
import { RedirectHelper } from "@/lib/redirectHelper";

type BillingInterval = "monthly" | "annual";

const PLANS = {
  free: {
    name: "Free",
    icon: Star,
    color: "slate",
    monthly_price: 0,
    annual_price: 0,
    tag: null,
    description: "For casual readers exploring RelayPost.",
  },
  plus: {
    name: "Plus",
    icon: Sparkles,
    color: "indigo",
    monthly_price: 99,
    annual_price: 899,
    tag: "Most Popular",
    description: "For power readers and knowledge professionals.",
  },
  pro: {
    name: "Pro",
    icon: Zap,
    color: "violet",
    monthly_price: 199,
    annual_price: 1799,
    tag: "Best Value",
    description: "For researchers, analysts, and enterprise users.",
  },
};

const FEATURES = [
  {
    category: "Reading & Discovery",
    icon: BookOpen,
    rows: [
      { feature: "Articles & News access", free: true, plus: true, pro: true },
      { feature: "Personalised feed", free: true, plus: true, pro: true },
      { feature: "Follow topics & categories", free: "Up to 5", plus: true, pro: true },
      { feature: "Bookmark articles", free: "Up to 20", plus: true, pro: true },
      { feature: "Bookmark news articles", free: "Up to 20", plus: true, pro: true },
      { feature: "Bookmark folders & tags", free: false, plus: true, pro: true },
    ],
  },
  {
    category: "AI Features",
    icon: Brain,
    rows: [
      { feature: "AI article summaries", free: "10 / month", plus: "40 / day", pro: "Unlimited" },
      { feature: "Ask AI about an article", free: "5 / month", plus: "25 / day", pro: "Unlimited" },
      { feature: "AI news summaries", free: "5 / month", plus: "40 / day", pro: "Unlimited" },
      { feature: "Weekly Intelligence Reports", free: false, plus: true, pro: true },
      { feature: "Cross-article synthesis", free: false, plus: false, pro: true },
      { feature: "Research Mode", free: false, plus: false, pro: "30 / month" },
    ],
  },
  {
    category: "Analytics & Insights",
    icon: BarChart2,
    rows: [
      { feature: "Reading history", free: true, plus: true, pro: true },
      { feature: "Topic trend analysis", free: false, plus: true, pro: true },
      { feature: "Usage analytics dashboard", free: false, plus: true, pro: true },
    ],
  },
  {
    category: "Support & Account",
    icon: Shield,
    rows: [
      { feature: "Email support", free: "Standard", plus: "Priority", pro: "Priority" },
      { feature: "7-day free trial", free: false, plus: true, pro: true },
      { feature: "Cancel anytime", free: true, plus: true, pro: true },
    ],
  },
];

const FAQS = [
  {
    q: "Is there really a free trial?",
    a: "Yes. Both Plus and Pro start with a free 7-day trial. We collect your payment method upfront to activate the trial — you won't be charged until the trial ends. Cancel anytime during the trial to pay nothing.",
  },
  {
    q: "What happens at the end of the trial?",
    a: "Your saved payment method is automatically charged on day 8 of the trial. You'll receive an email reminder 3 days before the trial ends.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, at any time. When you cancel autopay, you retain access to your current plan until the end of the billing period. After that, you move to the Free plan.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We use Razorpay and accept all major Indian payment methods: UPI, credit/debit cards, net banking, and wallets.",
  },
  {
    q: "What happens if my payment fails?",
    a: "We'll retry the payment automatically and notify you by email. You'll have a 3-day grace period to update your payment method before your plan is downgraded.",
  },
  {
    q: "Can I upgrade or downgrade?",
    a: "Yes. You can upgrade anytime — your new plan activates immediately. Downgrades take effect at the end of your current billing period.",
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={18} className="text-emerald-500 mx-auto" />;
  if (value === false) return <X size={18} className="text-slate-300 dark:text-slate-700 mx-auto" />;
  return <span className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center block">{value}</span>;
}

function PlanBadge({ tier }: { tier: string }) {
  const plan = PLANS[tier as keyof typeof PLANS];
  if (!plan?.tag) return null;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
      tier === "pro"
        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
    }`}>
      {plan.tag}
    </span>
  );
}

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span>{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/40 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingInterval>("annual");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const { tier: currentTier, tierStatus } = useTier();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    setIsLoggedIn(!!Cookies.get("access_token"));
    setIsLoaded(true);
  }, []);

  const annualSavings = { plus: Math.round(100 - (899 / (99 * 12)) * 100), pro: Math.round(100 - (1799 / (199 * 12)) * 100) };

  function getButtonProps(planTier: string) {
    if (!isLoaded) return { text: "...", href: "#", disabled: true, action: "none" };

    if (!isLoggedIn) {
      return {
        text: "Get started free",
        href: `/register`,
        disabled: false,
        action: "register"
      };
    }
    
    if (planTier === currentTier) {
      if (tierStatus?.cancel_at_period_end) {
        return {
          text: "Resubscribe",
          href: `/checkout?plan=${planTier}&billing=${billing}`,
          disabled: false,
          action: "upgrade"
        };
      }
      return {
        text: "Current Plan",
        href: "#",
        disabled: true,
        action: "none"
      };
    }

    if (currentTier === "pro") {
      return {
        text: "Included",
        href: "#",
        disabled: true,
        action: "none"
      };
    }

    if (currentTier === "plus") {
      if (planTier === "pro") {
        return {
          text: "Upgrade to Pro",
          href: `/checkout?plan=pro&billing=${billing}`,
          disabled: false,
          action: "upgrade"
        };
      } else {
        return {
          text: "Included",
          href: "#",
          disabled: true,
          action: "none"
        };
      }
    }

    // currentTier is free
    if (planTier === "free") {
      return {
        text: "Current Plan",
        href: "#",
        disabled: true,
        action: "none"
      };
    }

    return {
      text: "Start 7-day free trial",
      href: `/checkout?plan=${planTier}&billing=${billing}`,
      disabled: false,
      action: "upgrade"
    };
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0a0f1e] font-sans flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-50/60 via-transparent to-transparent dark:from-indigo-950/20 dark:via-transparent pointer-events-none" />
      <Navbar />
      <main className="flex-grow relative z-10">

        {/* Hero */}
        <section className="relative pt-12 pb-16 px-4 text-center overflow-hidden">
          <div className="relative max-w-3xl mx-auto">

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              Read smarter.<br className="hidden sm:block" /> Analyse deeper.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Start free. Upgrade when you need the intelligence layer.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-2">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  billing === "monthly"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  billing === "annual"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Annual
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">Save ~37%</span>
              </button>
            </div>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="px-4 pb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["free", "plus", "pro"] as const).map((tier) => {
              const plan = PLANS[tier];
              const Icon = plan.icon;
              const price = billing === "annual" ? plan.annual_price : plan.monthly_price;
              const isPlus = tier === "plus";
              const isPro = tier === "pro";
              const highlighted = isPro;

              return (
                <div
                  key={tier}
                  className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
                    highlighted
                      ? "bg-gradient-to-b from-violet-600 to-purple-800 border-violet-500 shadow-2xl shadow-violet-900/30 text-white scale-[1.02]"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg"
                  }`}
                >
                  {plan.tag && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      highlighted ? "bg-white text-violet-700 border border-violet-100 shadow-sm" : "bg-indigo-600 text-white"
                    }`}>
                      {plan.tag}
                    </div>
                  )}

                  <div className={`flex items-center gap-3 mb-5`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      highlighted ? "bg-white/20" : tier === "plus" ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-slate-100 dark:bg-slate-800"
                    }`}>
                      <Icon size={20} className={highlighted ? "text-white" : tier === "plus" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"} />
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${highlighted ? "text-white" : "text-slate-900 dark:text-white"}`}>{plan.name}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className={`text-4xl font-extrabold tabular-nums ${highlighted ? "text-white" : "text-slate-900 dark:text-white"}`}>
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    {price > 0 && (
                      <span className={`text-sm ml-1.5 ${highlighted ? "text-white/70" : "text-slate-400"}`}>
                        /{billing === "annual" ? "yr" : "mo"}
                      </span>
                    )}
                    {billing === "annual" && price > 0 && (
                      <p className={`text-xs mt-1 ${highlighted ? "text-white/60" : "text-slate-400"}`}>
                        ≈ ₹{Math.round(price / 12)}/mo billed annually
                      </p>
                    )}
                    {price === 0 && (
                      <p className={`text-xs mt-1 ${highlighted ? "text-white/70" : "text-slate-400"}`}>Forever free</p>
                    )}
                  </div>

                  <p className={`text-sm mb-6 ${highlighted ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>
                    {plan.description}
                  </p>

                  {(() => {
                    const btn = getButtonProps(tier);
                    const btnClass = `w-full py-3 rounded-xl font-bold text-sm text-center transition-all ${
                      btn.disabled
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed"
                        : highlighted
                        ? "bg-white text-violet-700 hover:bg-white/90"
                        : tier === "plus"
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`;

                    if (btn.disabled) {
                      return (
                        <button disabled className={btnClass}>
                          {btn.text}
                        </button>
                      );
                    }

                    if (btn.action === "register") {
                      return (
                        <Link
                          href={btn.href}
                          onClick={() => RedirectHelper.saveTarget("/pricing")}
                          className={btnClass}
                        >
                          {btn.text}
                        </Link>
                      );
                    }

                    return (
                      <Link href={btn.href} className={btnClass}>
                        {btn.text}
                      </Link>
                    );
                  })()}

                  {tier !== "free" && (
                    <p className={`text-[11px] text-center mt-2 ${highlighted ? "text-white/50" : "text-slate-400"}`}>
                      No charge until trial ends · Cancel anytime
                    </p>
                  )}

                  {/* Key feature bullets */}
                  <ul className={`mt-6 flex flex-col gap-2.5 text-sm`}>
                    {tier === "free" && [
                      "All articles & news",
                      "10 AI summaries / month",
                      "5 Ask AI / month",
                      "20 bookmarks",
                      "Follow 5 topics",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {tier === "plus" && [
                      "40 AI summaries / day",
                      "25 Ask AI / day",
                      "Weekly Intelligence Reports",
                      "Unlimited bookmarks + folders",
                      "Priority email support",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {tier === "pro" && [
                      "Unlimited AI summaries & Ask AI",
                      "Cross-article synthesis",
                      "Research Mode (30/month)",
                      "Weekly Intelligence Reports",
                      "All Plus features",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-white/80">
                        <Check size={14} className="text-emerald-300 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Full Feature Comparison Table */}
        <section className="px-4 pb-24 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10">Compare all features</h2>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60">
              <div className="px-5 py-4 font-semibold text-sm text-slate-500 dark:text-slate-400">Feature</div>
              {(["free", "plus", "pro"] as const).map((tier) => {
                const plan = PLANS[tier];
                const Icon = plan.icon;
                return (
                  <div key={tier} className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Icon size={15} className={tier === "pro" ? "text-violet-500" : tier === "plus" ? "text-indigo-500" : "text-slate-400"} />
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{plan.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature rows */}
            {FEATURES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.category}>
                  <div className="grid grid-cols-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700/40">
                    <div className="col-span-4 flex items-center gap-2 px-5 py-3">
                      <CatIcon size={14} className="text-indigo-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{cat.category}</span>
                    </div>
                  </div>
                  {cat.rows.map((row, i) => (
                    <div
                      key={row.feature}
                      className={`grid grid-cols-4 border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors`}
                    >
                      <div className="px-5 py-3.5 text-sm text-slate-700 dark:text-slate-300">{row.feature}</div>
                      <div className="px-4 py-3.5 flex items-center justify-center"><FeatureValue value={row.free} /></div>
                      <div className="px-4 py-3.5 flex items-center justify-center"><FeatureValue value={row.plus} /></div>
                      <div className="px-4 py-3.5 flex items-center justify-center"><FeatureValue value={row.pro} /></div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 pb-24 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">Frequently asked questions</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <FAQItem 
                key={faq.q} 
                q={faq.q} 
                a={faq.a} 
                isOpen={openFaq === faq.q}
                onToggle={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
              />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-4 pb-24 max-w-3xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 text-white">
            <p className="text-3xl font-extrabold mb-3">Ready to upgrade?</p>
            <p className="text-indigo-200 mb-7 text-base">7-day free trial. No charge until the trial ends. Cancel anytime.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/checkout?plan=plus&billing=annual" className="px-7 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                Start Plus Trial
              </Link>
              <Link href="/checkout?plan=pro&billing=annual" className="px-7 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border border-white/20 transition-colors">
                Start Pro Trial
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
