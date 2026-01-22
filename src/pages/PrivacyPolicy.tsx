import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
                <Shield className="w-4 h-4" />
                PRIVACY
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">
                Last updated: May 20, 2024
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border prose prose-slate max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At MindHaven, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. Collection of Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-2">
                  <li><strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register with the Site.</li>
                  <li><strong>Mood Data:</strong> Information you provide about your emotional state and reflections through our AI Mood Analyzer. This data is handled with extra care and encryption.</li>
                  <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. Use of Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                </p>
                <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-2">
                  <li>Create and manage your account.</li>
                  <li>Provide personalized wellness insights and recommendations.</li>
                  <li>Improve our AI models to better serve you.</li>
                  <li>Send you administrative information, such as security alerts or account updates.</li>
                  <li>Generate anonymous, aggregate data for research and platform improvement.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Security of Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">5. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions or comments about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-2 font-semibold text-foreground">privacy@mindhaven.com</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
