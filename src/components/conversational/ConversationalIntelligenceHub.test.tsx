import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ConversationalIntelligenceHub } from './ConversationalIntelligenceHub';

// Dados reais retornados pela edge function `conversational-intelligence`:
// ela não devolve comparação com o período anterior.
vi.mock('@/hooks/useConversationalIntelligence', () => ({
  useConversationalIntelligence: () => ({
    isLoading: false,
    data: {
      horizon_days: 30,
      kpis: {
        total_calls: 7,
        analyzed_calls: 5,
        total_duration_minutes: 84,
        avg_duration_minutes: 12,
        avg_sentiment: 0.31,
        avg_talk_ratio_salesperson: 0.58,
        avg_questions_per_call: 4,
        coverage_percent: 71,
      },
      sentiment_distribution: { positive: 3, neutral: 1, negative: 1 },
      top_objections: [],
      top_topics: [],
      recordings: [],
    },
  }),
}));

// Subpainéis com busca própria no Supabase ficam fora deste teste.
vi.mock('./RecordingSummaryDrawer', () => ({
  RecordingSummaryDrawer: () => null,
  useRecordingSummaryDrawer: () => ({ openId: null, open: vi.fn(), close: vi.fn() }),
}));
vi.mock('./CallLibrarySearch', () => ({ CallLibrarySearch: () => null }));
vi.mock('./CompetitorsAdminDialog', () => ({ CompetitorsAdminDialog: () => null }));
vi.mock('./metrics/ConversationMetricsFeed', () => ({
  ConversationMetricsFeed: () => null,
}));
vi.mock('./questions/QuestionFeedPanel', () => ({ QuestionFeedPanel: () => null }));
vi.mock('./objections/ObjectionLibraryPanel', () => ({
  ObjectionLibraryPanel: () => null,
}));
vi.mock('./coaching/CoachingLeaderboardPanel', () => ({
  CoachingLeaderboardPanel: () => null,
}));
vi.mock('./LiveIntelligenceFeed', () => ({ LiveIntelligenceFeed: () => null }));
vi.mock('./NeuralSoundwave', () => ({ NeuralSoundwave: () => null }));
vi.mock('./NeuralSentimentTimeline', () => ({ NeuralSentimentTimeline: () => null }));

describe('ConversationalIntelligenceHub — KPIs', () => {
  it('mostra os valores reais sem tendência inventada ao lado', () => {
    render(
      <MemoryRouter>
        <ConversationalIntelligenceHub />
      </MemoryRouter>
    );

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('84m')).toBeInTheDocument();
    expect(screen.getByText('0.31')).toBeInTheDocument();
    expect(screen.getByText('58%')).toBeInTheDocument();

    for (const fake of ['+12%', '-5%', '+0.05', 'Ideal']) {
      expect(screen.queryByText(fake)).not.toBeInTheDocument();
    }
  });
});
