import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white md:bg-[#F8F9FB] dark:bg-slate-900 dark:md:bg-[#0f172a] text-gray-900 dark:text-gray-300 transition-colors duration-300 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-slate-600 dark:text-slate-400">Last updated: July 2026</p>
        </div>

        <div className="space-y-12 prose dark:prose-invert prose-indigo max-w-none text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Agreement to Terms</h2>
            <p className="leading-relaxed">
              These Terms govern your access to and use of RelayPost. By using the platform, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Eligibility</h2>
            <p className="leading-relaxed">
              You must be at least 18 years old to create an account or make a contribution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Intellectual Property</h2>
            <p className="leading-relaxed">
              RelayPost&apos;s design, code, and original content are our property. News content aggregated 
              or summarized on the platform belong to their original sources; our summaries are provided for informational 
              convenience only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. User Representations</h2>
            <p className="leading-relaxed">
              By using the platform, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 dark:text-slate-400">
              <li>Provide accurate account information</li>
              <li>Use the platform only for lawful purposes</li>
              <li>Not attempt to disrupt or gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Contributions</h2>
            <p className="leading-relaxed">
              Contributions made via &quot;Support the Mission&quot; are one-time, voluntary payments processed through Razorpay, 
              and are non-refundable except where required by law. Any perks (like the Weekly Digest) are provided on 
              a best-effort basis and may change over time.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. AI-Generated Content Disclaimer</h2>
            <p className="leading-relaxed">
              AI-generated summaries and responses may contain errors or omissions and should not be treated as the sole 
              source of truth. We encourage verifying important information against original sources.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Modifications</h2>
            <p className="leading-relaxed">
              We may change, add, or remove features of the platform at any time as it evolves, without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              RelayPost is provided &quot;as is.&quot; To the extent permitted by law, we are not liable for any indirect or 
              consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Termination</h2>
            <p className="leading-relaxed">
              We may suspend or terminate accounts that violate these Terms or misuse the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">10. Contact Us</h2>
            <p className="leading-relaxed">
              Questions? Email us at kartikkalra2705@gmail.com or visit our <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4">Contact Page</Link>.
            </p>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
