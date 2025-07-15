**Type Safety & Enums**
- Use existing enums: Import and use enums from `app/types/design-tokens.ts` for design system values (ButtonVariant, IconContainerColor, BackgroundTheme) and `app/types/ui.ts` for UI behavior (IconPosition, LinkTarget)
- Avoid hardcoded strings: Never use hardcoded strings like `"secondary"`, `"right"`, `"_blank"` - always use the corresponding enum values (`ButtonVariant.SECONDARY`, `IconPosition.RIGHT`, `LinkTarget.BLANK`)
- Create new enums sparingly: Only add new enums if they represent reusable design system values or UI behavior patterns that will be used across multiple components

**Design System Integration**
- Use CSS custom properties: Reference goodparty-styleguide design tokens via CSS custom properties (`var(--color-brand-secondary)`) instead of hardcoded hex values
- Leverage existing design token mappings: Use the mapping objects in `design-tokens.ts` (like `ICON_CONTAINER_COLORS`, `BACKGROUND_COLOR_MAP`) rather than creating new color/style mappings
- Follow typography patterns: Use classes from `typography.css` (`.text-lead`, `.text-large`, `.leading-tight`) instead of inline font sizing

**Component Architecture & Reuse**
- Leverage existing components: Use shared components like `LinkButton`, `TestimonialCard`, etc. instead of building custom button/link combinations
- CSS Modules for responsive layouts: Use CSS modules with `auto-fit` grid patterns (like `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`) to handle responsive behavior efficiently
- Consolidate breakpoint rendering: Avoid rendering the same components multiple times for different breakpoints - use one responsive grid for desktop+tablet, separate mobile layout only when necessary
- Import organization: Import design system values from `design-tokens.ts`, UI behavior from `ui.ts`, maintain clear separation of concerns

**Performance & DRY Principles**
- Eliminate redundant constants: Don't create wrapper constants for enum values (avoid `const SECONDARY_VARIANT = ButtonVariant.SECONDARY`) - use enum values directly
- Shared utilities: Leverage existing utilities like `getLucideIcon()` instead of duplicating icon handling logic
- Consistent prop patterns: Follow established prop patterns for buttons, icons, and layout containers across components

**Responsive Design Patterns**
- Mobile-first approach: Design mobile layout first, then enhance for larger screens
- Consistent spacing: Use responsive padding/margin patterns like `px-5 lg:px-20 py-12 lg:py-20` that scale appropriately
- Grid best practices: Use `justify-items-center` for grid item alignment, `items-center` for flex centering, maintain consistent gap patterns

**Code Organization**
- Single responsibility: Keep design tokens in `design-tokens.ts`, UI behavior in `ui.ts`, component-specific styles in CSS modules
- Import efficiency: Group related imports, avoid individual constant imports when enum patterns exist
- Type definitions: Define clear TypeScript interfaces that use the established enum types rather than union string types

