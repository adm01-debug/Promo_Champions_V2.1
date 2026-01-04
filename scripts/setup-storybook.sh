#!/bin/bash
# Setup Storybook

echo "Installing Storybook..."
npx storybook@latest init --yes

echo "Installing addons..."
npm install --save-dev @storybook/addon-a11y
npm install --save-dev @storybook/addon-interactions

echo "✅ Storybook setup complete!"
echo "Run: npm run storybook"
