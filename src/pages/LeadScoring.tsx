import { Helmet } from "react-helmet-async";
import { LeadScoringDashboard } from "@/components/lead-scoring/LeadScoringDashboard";

export default function LeadScoring() {
  return (
    <>
      <Helmet>
        <title>Lead Scoring | Promo Champions</title>
        <meta name="description" content="Pontuação inteligente de leads" />
      </Helmet>
      <LeadScoringDashboard />
    </>
  );
}
