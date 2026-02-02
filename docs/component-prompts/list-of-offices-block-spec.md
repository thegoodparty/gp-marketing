# List of Offices Block - Implementation Specification

## Overview
A component that displays a list of office positions with filtering by year. The component displays offices in a table format on desktop and a card-based list on mobile.

## Design Requirements

### Visual Design
- **Container**: Light-colored card with rounded corners and purple dashed border (`border-dashed border-lavender-600` or similar purple)
- **Heading**: "List of Offices" text with a small purple diamond icon positioned above the card
- **Headline**: Bold "Headline" text inside the card
- **Year Selector**: Dropdown input displaying "2028" with a calendar icon, positioned to the right of the headline
- **Table Layout (Desktop)**:
  - Three column headers: "Type", "Position", "Next Election Date"
  - Each row contains:
    - Blue rectangular tag labeled "STATE" in the Type column
    - Office position name in the Position column
    - Election date (e.g., "November 5, 2028") in the Next Election Date column
    - Right-pointing arrow icon at the far right of each row
- **Card Layout (Mobile)**:
  - Vertical list of individual card-like items
  - Each card contains:
    - Blue "STATE" tag
    - Office position name
    - Election date
    - Right-pointing arrow icon
  - Cards have rounded corners and distinct spacing

### Responsive Behavior
- **Desktop**: Table layout with columns
- **Mobile**: Card-based vertical list layout
- Breakpoint: Use `md:` prefix for desktop (typically 768px+)

### Color Palette
- **Purple border**: Use lavender color from design system (`lavender-600` or similar)
- **Blue tags**: Use `goodparty-blue` or `info-500` for STATE tags
- **Background**: Light gray/cream background (`goodparty-cream` or `neutral-50`)

## Component Structure

### Props Interface
```typescript
export interface OfficeItem {
  id: string;
  type: 'STATE' | 'COUNTY' | 'CITY' | string; // Office type
  position: string; // Office position name
  nextElectionDate: string; // Formatted date string
  href?: string; // Optional link to office detail page
}

export interface ListOfOfficesBlockProps {
  className?: string;
  backgroundColor?: 'cream' | 'midnight';
  headline?: string;
  defaultYear?: number; // Default year for filter (e.g., 2028)
  availableYears?: number[]; // Years available in dropdown
  offices: OfficeItem[];
  onYearChange?: (year: number) => void;
  onOfficeClick?: (office: OfficeItem) => void;
}
```

### Component Features
1. **Year Filter Dropdown**
   - Displays current selected year
   - Calendar icon on the right
   - Filters offices by election year
   - Styled similar to ElectionsSearchHero select

2. **Office List Display**
   - Desktop: Table with columns
   - Mobile: Card-based list
   - Each row/card is clickable if href is provided
   - Hover states for interactive elements

3. **Type Tags**
   - Blue rectangular tags
   - Display office type (STATE, COUNTY, CITY, etc.)
   - Styled similar to existing Tag component but with blue background

4. **Icons**
   - Purple diamond icon for heading (if available in icon set)
   - Calendar icon for year selector
   - Right arrow icon for each office row/card

## Implementation Details

### File Structure
```
src/ui/ListOfOfficesBlock.tsx
src/ui/ListOfOfficesBlock.stories.tsx
src/sanity/schema/components/component_listOfOfficesBlock.ts
src/PageSections/ListOfOfficesBlockSection.tsx
```

### Styling Approach
- Use `tailwind-variants` (tv) for component styling
- Follow existing component patterns (ElectionsIndexBlock, ElectionsSearchHero)
- Use design system colors from `colors.css`
- Purple dashed border: `border-2 border-dashed border-lavender-600`
- Responsive breakpoints: `md:` for desktop, base styles for mobile

### Sanity Schema Fields
- `field_headline`: String (optional)
- `field_defaultYear`: Number (default: current year + 1)
- `field_availableYears`: Array of numbers
- `list_offices`: Array of office objects:
  - `field_type`: String (STATE, COUNTY, CITY)
  - `field_position`: String
  - `field_nextElectionDate`: Date
  - `field_href`: String (optional link)
- `listOfOfficesBlockDesignSettings`: Design settings group
  - `field_blockColorCreamMidnight`: Background color
- `componentSettings`: Standard component settings
  - `field_anchorId`: Anchor ID for navigation

### Accessibility
- Proper table semantics (`<table>`, `<thead>`, `<tbody>`) for desktop
- ARIA labels for year selector
- Keyboard navigation support
- Focus states for interactive elements

### Data Formatting
- Dates: Format as "Month Day, Year" (e.g., "November 5, 2028")
- Use Luxon or native Date formatting utilities

## Example Usage

```tsx
<ListOfOfficesBlock
  headline="Headline"
  defaultYear={2028}
  availableYears={[2024, 2025, 2026, 2027, 2028]}
  offices={[
    {
      id: '1',
      type: 'STATE',
      position: 'Name of office position',
      nextElectionDate: 'November 5, 2028',
      href: '/offices/1'
    },
    // ... more offices
  ]}
  backgroundColor="cream"
/>
```

## Testing Considerations
- Test with various numbers of offices (0, 1, 8, 20+)
- Test year filtering functionality
- Test responsive breakpoints
- Test with different office types
- Test click handlers and navigation
- Test accessibility with screen readers
