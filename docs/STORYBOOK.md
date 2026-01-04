# Storybook Setup

## Installation

```bash
npx storybook@latest init
```

## Usage

```bash
npm run storybook
```

## Writing Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Button',
  },
};
```

## Best Practices

- Write stories for all shared components
- Test different states
- Document props
- Include accessibility tests
