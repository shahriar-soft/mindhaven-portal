import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <FileText className="w-4 h-4" />
                LEGAL
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">
                Last updated: May 20, 2024
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border prose prose-slate max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using MindHaven, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. Use License</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Permission is granted to temporarily use MindHaven for personal, non-commercial transitory viewing and interaction. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-2">
                  <li>Modify or copy the materials.</li>
                  <li>Use the materials for any commercial purpose.</li>
                  <li>Attempt to decompile or reverse engineer any software contained on the MindHaven platform.</li>
                  <li>Remove any copyright or other proprietary notations from the materials.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed italic">
                  MindHaven is not a medical provider. The content and tools provided are for informational purposes only and are not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Limitations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall MindHaven or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MindHaven, even if MindHaven or a MindHaven authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">5. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
