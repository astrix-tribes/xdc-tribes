# Frontend Components

This document provides information about the key frontend components used in the Tribes platform.

## Overview

The Tribes frontend is built using React and Next.js, with a component-based architecture that enables reusability and maintainability.

## Key Components

### Authentication Components

- Web3AuthModal
- WalletConnect

### Community Components

- TribeList
- TribeModal
- CreateTribeForm

### Content Components

- Post
- PostList
- CreatePostForm
- PostModal

### Layout Components

- FeedLayout
- Navigation

## Component Architecture

The Tribes platform follows a modular component architecture that separates concerns and promotes reusability:

### Atomic Design Pattern

The component structure follows an adapted atomic design pattern:

1. **Atoms**: Basic UI elements like buttons, inputs, and icons
   - These are found in `src/components/ui/` directory
   - Examples: Button, Input, Icon, Badge

2. **Molecules**: Combinations of atoms that form more complex components
   - Examples: SearchBar, TribeItem, PostCard

3. **Organisms**: Functional component groups that form distinct sections
   - Examples: TribeList, PostList, Navigation

4. **Templates**: Page layouts that arrange organisms into full interfaces
   - Examples: FeedLayout, TribeDetailLayout

5. **Pages**: Complete views composed of templates and organisms
   - Located in `src/app/` directory
   - Examples: HomePage, TribePage, ProfilePage

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Navigation
│   │   └── Web3AuthButton
│   └── Footer
├── Pages
│   ├── HomePage
│   │   ├── TribeList
│   │   └── PostList
│   ├── TribePage
│   │   ├── TribeHeader
│   │   ├── MembersList
│   │   └── TribalFeed
│   └── ProfilePage
│       ├── ProfileHeader
│       ├── UserStats
│       └── ActivityFeed
└── Shared Components
    ├── Modals
    │   ├── TribeModal
    │   └── PostModal
    └── Forms
        ├── CreateTribeForm
        └── CreatePostForm
```

### Context-Based State Management

The application uses React Context API for state management:
- `Web3AuthProvider`: Manages wallet connection and authentication
- `PostsContext`: Handles posts and tribes data
- `ProfileContext`: Manages user profile information

## Styling System

The Tribes platform uses a combination of styling approaches for consistent design:

### Tailwind CSS

The primary styling system is Tailwind CSS, which provides:
- Utility-first approach for rapid development
- Consistent design tokens (colors, spacing, typography)
- Responsive design utilities
- Dark mode support out of the box

Custom Tailwind configuration (`tailwind.config.js`) includes:
- Extended color palette with the platform's brand colors
- Custom animation definitions
- Screen breakpoints aligned with the design system

### Component-Specific Styling

For more complex components, we use:
- CSS Modules for component-scoped styles
- Custom CSS classes for animations and transitions
- Global CSS variables for theme-wide properties

### Design Tokens

Key design tokens used throughout the application:
- **Colors**:
  - Primary: Purple (`#7e22ce` to `#a855f7`)
  - Secondary: Blue (`#3b82f6` to `#60a5fa`)
  - Background: Dark (`#111827` to `#1f2937`)
  - Text: Light (`#f9fafb` to `#d1d5db`)
  - Accents: Various based on semantic meanings

- **Typography**:
  - Primary font: Inter (sans-serif)
  - Heading sizes: 2xl (24px) to 5xl (48px)
  - Body sizes: sm (14px) to lg (18px)

- **Spacing**:
  - Based on 4px increments (4, 8, 16, 24, 32, 48, 64)

- **Animations**:
  - Transitions: 300ms duration, ease-in-out
  - Hover effects: Scale, color, and shadow changes

### Responsive Design

The UI adapts to different screen sizes with these breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Component Best Practices

When creating and using components in the Tribes platform, follow these guidelines:

### Component Creation

1. **Single Responsibility**:
   - Each component should do one thing well
   - Split complex components into smaller, focused ones

2. **Props Interface**:
   - Define clear TypeScript interfaces for all props
   - Use descriptive prop names and include JSDoc comments
   - Provide sensible default values when appropriate

```tsx
interface ButtonProps {
  /** The text content of the button */
  label: string;
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'text';
  /** Optional click handler */
  onClick?: () => void;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  onClick,
  isLoading = false
}) => {
  // Implementation
};
```

3. **Performance Optimization**:
   - Use React.memo for pure functional components
   - Implement useMemo and useCallback for expensive operations
   - Avoid unnecessary re-renders with proper dependency arrays

4. **Accessibility**:
   - Include proper ARIA attributes
   - Ensure keyboard navigation works
   - Maintain sufficient color contrast (WCAG AA standard)
   - Support screen readers with semantic HTML

### Component Usage

1. **Component Composition**:
   - Favor composition over complex conditional rendering
   - Use children props for flexible content structure
   - Create specialized components instead of overloading props

2. **Error Handling**:
   - Implement error boundaries for critical component trees
   - Provide meaningful fallbacks for loading and error states
   - Validate props with TypeScript and runtime checks

3. **Testing**:
   - Write unit tests for each component
   - Test different prop combinations and states
   - Include accessibility and interaction tests

4. **Documentation**:
   - Document component API with JSDoc comments
   - Include usage examples for complex components
   - Note any side effects or context dependencies

### Integration with Backend

1. **Data Fetching**:
   - Separate data fetching logic from UI components
   - Create custom hooks for API interactions
   - Handle loading, error, and success states consistently

2. **Form Handling**:
   - Use controlled components for form inputs
   - Implement proper validation with error messages
   - Show loading indicators during form submission

3. **Smart/Dumb Component Pattern**:
   - Create "smart" container components that handle data and logic
   - Create "dumb" presentational components that focus on UI
   - Pass data and callbacks from smart to dumb components

These guidelines ensure consistent, maintainable, and high-quality components throughout the Tribes platform. 