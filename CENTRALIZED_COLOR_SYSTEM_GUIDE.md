# Centralized Color System Guide

## 🎨 Design Tokens - Don't Hardcode Colors!

### Overview
This project uses a **centralized color system** with CSS variables and Tailwind theme colors. **Never hardcode hex values** in your components - use the design tokens instead!

---

## 📚 Available Color Tokens

### Background Colors
```tsx
// Deep dark background (for cards, surfaces)
bg-background-deep        // #0a0604

// Default background (page level)
bg-background             // #0B0F14

// Surface colors (elevated content)
bg-surface                // #121821
bg-surface-elevated       // #1A2330
```

### Primary/Accent Colors
```tsx
// Primary amber
bg-primary                // #F59E0B
text-primary              // #F59E0B
border-primary            // #F59E0B

// Hover state
bg-primary-hover          // #FFB020
text-primary-hover        // #FFB020

// Light variant
bg-primary-light          // #FDE68A
text-primary-light        // #FDE68A

// Glow effects
shadow-[var(--primary-glow)]  // rgba(245, 158, 11, 0.3)
```

### Text Colors
```tsx
// Primary text (white)
text-text-primary         // #FFFFFF

// Secondary text (gray)
text-text-secondary       // #9CA3AF

// Muted text (darker gray)
text-text-muted           // #6B7280
```

### Border Colors
```tsx
// Light borders
border-border-light       // #1F2937

// Medium borders
border-border-medium      // #374151
```

### Glass Effects
```tsx
// Glass backgrounds
bg-glass-bg               // rgba(18, 24, 33, 0.6)

// Glass borders
border-glass-border       // rgba(31, 41, 55, 0.5)
```

---

## ✅ How to Use - Examples

### Card Components

**❌ WRONG - Hardcoded Colors:**
```tsx
<div className="bg-[#121821] border border-[#1F2937]">
  <p className="text-[#9CA3AF]">Content</p>
</div>
```

**✅ CORRECT - Design Tokens:**
```tsx
<div className="bg-surface border border-border-light">
  <p className="text-text-secondary">Content</p>
</div>
```

---

### Deep Dark Cards

**❌ WRONG:**
```tsx
<div className="bg-[#0a0604] hover:bg-[#121821]">
```

**✅ CORRECT:**
```tsx
<div className="bg-background-deep hover:bg-surface">
```

---

### Active States

**❌ WRONG:**
```tsx
<div className="bg-[#1A2330] ring-2 ring-[#F59E0B]">
```

**✅ CORRECT:**
```tsx
<div className="bg-surface-elevated ring-2 ring-primary">
```

---

### Gradient Backgrounds

**❌ WRONG:**
```tsx
<div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#FFB020]/10">
```

**✅ CORRECT:**
```tsx
<div className="bg-gradient-to-r from-primary/10 to-primary-hover/10">
```

---

### Shadows & Glows

**❌ WRONG:**
```tsx
<div className="shadow-lg shadow-[#F59E0B]/30">
```

**✅ CORRECT:**
```tsx
<div className="shadow-lg shadow-primary-glow">
```

---

### Borders with Hover

**❌ WRONG:**
```tsx
<button className="border border-[#1F2937] hover:border-[#374151]">
```

**✅ CORRECT:**
```tsx
<button className="border border-border-light hover:border-border-medium">
```

---

### Text Hierarchy

**❌ WRONG:**
```tsx
<h3 className="text-white">{title}</h3>
<p className="text-[#9CA3AF]">{subtitle}</p>
<span className="text-[#6B7280]">{muted}</span>
```

**✅ CORRECT:**
```tsx
<h3 className="text-text-primary">{title}</h3>
<p className="text-text-secondary">{subtitle}</p>
<span className="text-text-muted">{muted}</span>
```

---

## 🔄 Updating Existing Components

### Example: BeatCard Component

**Before (Hardcoded):**
```tsx
<button
  className={`bg-[#0a0604] hover:bg-[#121821] border border-[#1F2937] 
    hover:border-[#374151] active:bg-[#1A2330] ring-[#F59E0B]`}
>
  <div className="text-[#9CA3AF]">{artist}</div>
</button>
```

**After (Design Tokens):**
```tsx
<button
  className={`bg-background-deep hover:bg-surface border border-border-light 
    hover:border-border-medium active:bg-surface-elevated ring-primary`}
>
  <div className="text-text-secondary">{artist}</div>
</button>
```

---

## 🎯 Benefits of This System

### 1. Easy Theme Updates
Change colors in **ONE PLACE** (`globals.css`) and it updates everywhere!

### 2. Consistency
No more random hex values scattered throughout the codebase.

### 3. Maintainability
New developers can easily understand the color system.

### 4. Flexibility
Want to change the entire brand color? Just update CSS variables!

### 5. Accessibility
Ensures proper contrast ratios are maintained globally.

---

## 📋 Quick Reference Table

| Purpose | Class Name | Hex Value |
|---------|------------|-----------|
| **Backgrounds** | | |
| Deep dark | `bg-background-deep` | `#0a0604` |
| Page default | `bg-background` | `#0B0F14` |
| Surface | `bg-surface` | `#121821` |
| Elevated | `bg-surface-elevated` | `#1A2330` |
| | | |
| **Text** | | |
| Primary | `text-text-primary` | `#FFFFFF` |
| Secondary | `text-text-secondary` | `#9CA3AF` |
| Muted | `text-text-muted` | `#6B7280` |
| | | |
| **Accent** | | |
| Primary | `text-primary`, `bg-primary` | `#F59E0B` |
| Hover | `text-primary-hover` | `#FFB020` |
| Light | `text-primary-light` | `#FDE68A` |
| | | |
| **Borders** | | |
| Light | `border-border-light` | `#1F2937` |
| Medium | `border-border-medium` | `#374151` |

---

## 🔧 For Login Page & Other Pages

Instead of updating every hardcoded color, simply:

1. **Update the CSS variables** in `globals.css`
2. **All pages automatically update** (login, profile, settings, etc.)

**Example - Changing Brand Color:**

```css
/* globals.css */
:root {
  --primary: #YOUR_NEW_COLOR;
}
```

Every component using `text-primary`, `bg-primary`, `ring-primary`, etc. will automatically update!

---

## 🚀 Migration Strategy

### Phase 1: New Components
Always use design tokens for new components.

### Phase 2: Critical Components
Update high-traffic components first (BeatCard, PlaylistCard, etc.)

### Phase 3: Remaining Components
Gradually migrate other pages (login, profile, settings)

### Tools
Use Find & Replace with regex:
- Find: `bg-\[\#0a0604\]`
- Replace: `bg-background-deep`

---

## 💡 Pro Tips

1. **Use semantic names**: Think about the purpose (surface, elevated), not the color
2. **Opacity modifiers**: Use `/10`, `/20`, etc. with any token
3. **Hover states**: Always pair with appropriate hover token
4. **Consistency**: Same purpose = same token across all components

---

## 📖 Examples by Component Type

### Music Cards
```tsx
className="bg-background-deep hover:bg-surface border border-border-light"
```

### Buttons
```tsx
className="bg-primary hover:bg-primary-hover text-black"
```

### Navigation
```tsx
className="bg-surface text-text-secondary hover:text-text-primary"
```

### Forms
```tsx
className="bg-background border-border-light focus:border-primary"
```

### Modals
```tsx
className="bg-surface-elevated border border-border-light"
```

---

## ✅ Summary

**NEVER HARDCODE COLORS!** Use:
- `bg-background-deep` instead of `#0a0604`
- `bg-surface` instead of `#121821`
- `text-primary` instead of `#F59E0B`
- `border-border-light` instead of `#1F2937`

Your future self (and teammates) will thank you! 🙏
