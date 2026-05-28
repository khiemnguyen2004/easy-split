# Design Spec: EasySplit "Sunrise Glass" UI

**Date**: 2026-04-11
**Topic**: Frontend Design Refactor
**Aesthetic**: Playful Glassmorphism ("Floating Bloom")

## 1. Overview
The "Sunrise Glass" design transforms EasySplit from a utility billing app into a premium, organic social financial tool. It uses layered translucency (glassmorphism) over a dynamicindigo mesh background with vibrant Sunrise Coral accents.

## 2. Visual Identity & Theme
- **Tone**: Playful, high-end, energetic.
- **Colors**:
  - **Primary Background**: Mesh Gradient (#2E3192 Indigo -> #1B1464 Deep Violet).
  - **Accent**: Sunrise Coral Gradient (#FF512F Sunset Orange -> #DD2476 Hot Pink).
  - **Glass Surface**: White (#FFFFFF) at 10-20% opacity.
- **Typography**:
  - **Headings**: "Outfit" (Bold/Medium) for a geometric, friendly look.
  - **Body**: "Outfit" (Light/Regular) or "Inter" for clarity.
- **Micro-interactions**: Subtle scale-up on card press, glowing active states for navigation.

## 3. Architecture & Components
We will implement a design-system-first approach by creating primitive components in `mobile-app/src/components/ui/`:

### UI Primitives
- **`GlassCard.tsx`**: Uses `BlurView` and NativeWind for translucent, blurred containers.
- **`MeshBackground.tsx`**: The foundational full-screen layout component.
- **`SunriseButton.tsx`**: A primary action button with the Sunrise Coral gradient.
- **`GlassText.tsx`**: Text variants with appropriate contrast for glass backgrounds.

### Layout
- **Auth Screens**: Centered glass cards with minimalist inputs.
- **Dashboard (Tabs)**: A list of "Floating Bloom" cards for groups and expenses.
- **Tab Bar**: A floating, rounded pill container (frosted glass) detached from the bottom.

## 4. Technical Constraints
- **Framework**: Expo (SDK 55+), React Native.
- **Styling**: NativeWind (Tailwind CSS) + `expo-linear-gradient`.
- **Icons**: `lucide-react-native`.
- **Blur**: `expo-blur`.

## 5. Success Criteria
- [ ] UI feels cohesive and premium.
- [ ] No generic "AI slop" aesthetics (standard colors, system fonts).
- [ ] High responsiveness and accessibility maintained.
- [ ] Glassmorphism effects perform well on device (monitored via `expo-blur`).

## 6. Implementation Stages
1. **Foundation**: CSS variables, theme configuration, MeshBackground.
2. **Primitives**: GlassCard, SunriseButton, Typography.
3. **Screen Refactor**: Apply theme to Login, Register, and Dashboard.
4. **Polish**: Navigation transition, glows, and micro-animations.
