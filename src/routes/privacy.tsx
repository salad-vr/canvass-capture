import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="bg-brand-gradient py-10 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Legal</div>
          <h1 className="mt-2 text-4xl font-extrabold">Privacy Policy</h1>
          <p className="mt-2 text-white/80">How we handle campaign data.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3">Overview</h2>
            <p className="text-muted-foreground">
              This privacy policy explains how Canvass Capture collects, uses, and protects 
              information gathered during political canvassing activities for the Shelley Carroll 
              campaign. This is an internal campaign tool.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Photographs of completed walk sheets</li>
              <li>Voter names, addresses, and contact information (from walk sheets)</li>
              <li>Canvassing support levels and sign requests</li>
              <li>Volunteer names and route assignments</li>
              <li>Device/browser information for app functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">How We Use Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Extract and digitize voter contact data from walk sheets</li>
              <li>Track canvassing progress and volunteer assignments</li>
              <li>Generate campaign reports and CSV exports</li>
              <li>Improve data accuracy through volunteer review</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Data Storage</h2>
            <p className="text-muted-foreground">
              All data is stored securely in Supabase databases. Walk sheet photographs are stored 
              temporarily for processing and may be retained for record-keeping. Extracted data is 
              stored in structured tables for campaign use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell or share voter data with third parties. Data is used solely for 
              campaign purposes. CSV exports may be shared with authorized campaign staff only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Your Rights</h2>
            <p className="text-muted-foreground">
              Campaign staff can review, correct, or delete records at any time. Contact the 
              campaign data manager for data removal requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              For questions about this privacy policy or data handling, contact the Shelley 
              Carroll campaign office.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
