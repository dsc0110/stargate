# Portfolio Component Structure

This directory contains a refactored portfolio component with improved code organization.

## File Structure

```
portfolio/
├── +page.svelte          # Main portfolio page component
├── MetricCard.svelte     # Reusable metric display component
├── add.svelte           # Add portfolio item component
├── table.svelte         # Portfolio table view component
├── chart.svelte         # Portfolio chart view component
├── config.ts            # Configuration constants
├── styles.ts            # Shared style definitions
├── types.ts             # TypeScript type definitions
├── utils.ts             # Utility functions
└── index.ts             # Central export file
```

## Key Improvements

### ✅ **Separation of Concerns**

- **Configuration**: All constants in `config.ts`
- **Styling**: Centralized in `styles.ts`
- **Logic**: Utility functions in `utils.ts`
- **Types**: TypeScript definitions in `types.ts`

### ✅ **Maintainability**

- Single source of truth for configurations
- Reusable style constants
- Type safety across components
- Clean imports via `index.ts`

### ✅ **Code Organization**

- No inline style objects
- No hardcoded configuration
- Consistent naming conventions
- Clear file responsibility

## Usage

```typescript
// Clean imports from central location
import { PORTFOLIO_CONFIG, SHARED_STYLES, getButtonClasses } from './index.js';

// Type-safe props
interface Props extends PortfolioMetric {}

// Utility function usage
const buttonClass = getButtonClasses(isActive);
```

## Benefits

1. **Easy Configuration Changes**: Update `config.ts` once, affects all components
2. **Consistent Styling**: Shared styles prevent drift and duplication
3. **Better Developer Experience**: Clear structure and type safety
4. **Easier Testing**: Separated logic from presentation
5. **Maintainable Code**: Clear separation of concerns
