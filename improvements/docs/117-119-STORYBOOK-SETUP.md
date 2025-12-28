# Storybook Setup Guide

## 📚 Melhorias 117-119 - Component Documentation

### Installation
```bash
npx storybook@latest init
```

### Configuration

**`.storybook/main.ts`**
```typescript
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
```

**`.storybook/preview.ts`**
```typescript
import type { Preview } from "@storybook/react";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

### Example Stories

**Button Component (src/components/ui/Button.stories.tsx)**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '🚀',
  },
};
```

**Card Component (src/components/ui/Card.stories.tsx)**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  ),
};
```

**DealCard Component (src/components/pipeline/DealCard.stories.tsx)**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { DealCard } from './DealCard';

const meta = {
  title: 'Pipeline/DealCard',
  component: DealCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DealCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDeal = {
  id: '1',
  title: 'Acme Corp - Enterprise Plan',
  value: 50000,
  client_name: 'Acme Corporation',
  stage: 'proposal',
  probability: 0.75,
  days_in_stage: 5,
};

export const Default: Story = {
  args: {
    deal: mockDeal,
  },
};

export const HighValue: Story = {
  args: {
    deal: { ...mockDeal, value: 150000 },
  },
};

export const AtRisk: Story = {
  args: {
    deal: { ...mockDeal, days_in_stage: 45, probability: 0.2 },
  },
};
```

### Run Storybook
```bash
npm run storybook
```

### Build Storybook
```bash
npm run build-storybook
```

### Deploy to Vercel/Netlify
```bash
vercel --prod --name=salespro-storybook ./storybook-static
```

## 📝 Component Coverage

### Priority Components to Document:

**UI Components (49 total):**
- Button ✅
- Card ✅
- Input
- Select
- Dialog
- Toast
- ... (remaining 43)

**Dashboard Components (11 total):**
- KPICard
- MetricChart
- RevenueChart
- ... (remaining 8)

**Pipeline Components (5 total):**
- DealCard ✅
- StageColumn
- PipelineBoard
- ... (remaining 2)

**Target: 65+ components documented**
