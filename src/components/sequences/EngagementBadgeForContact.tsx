import { useEngagementScore, type ContactType } from "@/hooks/engagement/useEngagementScore";
import { EngagementScoreBadge } from "@/components/engagement/EngagementScoreBadge";

interface Props {
  contactId: string;
  contactType: ContactType;
}

/** Inline engagement badge that fetches its own score per contact. */
export function EngagementBadgeForContact({ contactId, contactType }: Props) {
  const { data } = useEngagementScore(contactId, contactType);
  if (!data?.score) return null;
  return <EngagementScoreBadge score={data.score.score} tier={data.score.tier} size="sm" />;
}
