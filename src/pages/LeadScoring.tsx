import { Helmet } from "react-helmet-async";
import { LeadScoringDashboard } from "@/components/lead-scoring/LeadScoringDashboard";
import { PageTransition } from "@/components/ui/page-transition";

export default function LeadScoring() {
  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Lead Scoring | Promo Champions</title>
        <meta name="description" content="Pontuação inteligente de leads" />
      </Helmet>
      <LeadScoringDashboard />
    </>
    </PageTransition>
  );
}
