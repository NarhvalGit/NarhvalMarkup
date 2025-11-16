# Markdown to PDF Converter - Design Style Guide

## Design Philosophy

### Visual Language
**Editorial Sophistication**: Drawing inspiration from high-end design publications like Kinfolk, Wired, and The Gentlewoman, the aesthetic emphasizes clean lines, thoughtful typography, and purposeful white space. The design communicates professionalism while maintaining approachability.

### Color Palette
**Monochromatic Foundation with Accent Highlights**:
- **Primary**: Warm off-white (#FEFCF8) - main background
- **Secondary**: Deep charcoal (#2C2C2C) - primary text
- **Tertiary**: Medium gray (#6B6B6B) - secondary text
- **Accent**: Warm terracotta (#C4856A) - interactive elements and highlights
- **Supporting**: Soft sage (#E8EDE9) - subtle backgrounds and dividers

### Typography
**Editorial Hierarchy**:
- **Display Font**: "Tiempos Headline" - Bold serif for headings and hero text
- **Body Font**: "Suisse Int'l" - Clean sans-serif for content and UI
- **Code Font**: "JetBrains Mono" - Monospace for markdown and code blocks
- **Contrast Ratio**: Minimum 4.5:1 for all text combinations

## Visual Effects & Styling

### Core Libraries Integration
1. **Anime.js**: Smooth micro-interactions and page transitions
2. **Splitting.js**: Text reveal animations for headings
3. **ECharts.js**: Usage statistics and conversion metrics
4. **Splide.js**: Theme preview carousel
5. **p5.js**: Subtle background particle effects
6. **Pixi.js**: Interactive document preview effects

### Animation Strategy
**Subtle Motion Design**:
- **Text Reveals**: Staggered character animations using Splitting.js
- **Hover States**: Gentle 3D transforms and shadow depth changes
- **Loading States**: Elegant progress indicators with Anime.js
- **Transitions**: Smooth page navigation with fade and slide effects
- **Micro-interactions**: Button press feedback and form field focus

### Header & Navigation Effects
**Sophisticated Navigation**:
- **Glass morphism** navigation bar with backdrop blur
- **Smooth color transitions** on scroll
- **Active state indicators** with subtle underline animations
- **Mobile-responsive** hamburger menu with elegant transitions

### Background & Layout
**Layered Depth**:
- **Primary Background**: Consistent warm off-white throughout
- **Subtle Texture**: Paper-like grain overlay for editorial feel
- **Section Differentiation**: Intrusive side elements and decorative blocks
- **Grid System**: 12-column responsive grid with generous gutters

### Interactive Elements
**Tactile Digital Experience**:
- **Buttons**: Soft shadows with hover depth effects
- **Form Fields**: Clean borders with focus state animations
- **Cards**: Subtle elevation changes on interaction
- **Theme Previews**: Live preview with smooth transitions
- **File Upload**: Drag-and-drop with visual feedback

### Content Styling
**Editorial Presentation**:
- **Hero Section**: Large typography with animated text reveals
- **Feature Cards**: Clean white cards with soft shadows
- **Preview Panels**: Split-screen layout with synchronized scrolling
- **Theme Gallery**: Horizontal scrolling carousel with smooth transitions
- **Statistics**: Elegant data visualization with ECharts.js

### Responsive Design
**Mobile-First Approach**:
- **Breakpoints**: 
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px  
  - Desktop: 1024px+
- **Typography Scaling**: Fluid typography using clamp() functions
- **Layout Adaptation**: Stack to split-screen transitions
- **Touch Interactions**: Optimized for mobile gestures

### Accessibility Considerations
**Inclusive Design**:
- **High Contrast**: All text meets WCAG AA standards
- **Focus Indicators**: Clear keyboard navigation states
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Motion Preferences**: Respect prefers-reduced-motion settings
- **Color Independence**: Information not conveyed by color alone

## Component-Specific Styling

### Markdown Editor
- **Syntax Highlighting**: Custom theme with muted colors
- **Line Numbers**: Subtle gray numbering on the left
- **Cursor**: Custom accent-colored cursor
- **Selection**: Soft accent color for text selection

### PDF Preview
- **Document Frame**: Realistic paper shadow and border
- **Typography Preview**: Accurate font rendering
- **Page Breaks**: Visual indicators for pagination
- **Print Margins**: Dotted lines showing print boundaries

### Theme Selector
- **Preview Thumbnails**: Miniature document previews
- **Active State**: Subtle border and shadow emphasis
- **Hover Effects**: Gentle zoom and shadow depth
- **Transition**: Smooth theme switching animation

### File Upload Area
- **Drag State**: Visual feedback with dashed borders
- **Upload Progress**: Elegant progress bar with percentage
- **Success State**: Checkmark animation with color change
- **Error State**: Subtle red highlighting with helpful messaging

This design system creates a cohesive, professional experience that feels both modern and timeless, perfect for users who value quality document presentation.