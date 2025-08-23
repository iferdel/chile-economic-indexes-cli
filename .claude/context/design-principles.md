# Static Web File Server For Showing Trends on Specific/Custom Set of Chilean Economic Indicators Series From BCCh

## I. Core Design Philosophy & Strategy

*   [ ] **Users First:** Prioritize data representation using best practices and reference material.
*   [ ] **Meticulous Craft:** Aim for clear and high quality in every UI element and interaction.
*   [ ] **Speed & Performance:** Design for fast load times and snappy, responsive interactions.
*   [ ] **Simplicity & Clarity:** Strive for a clean and simplistic, even 'compact', uncluttered interface. Ensure labels, instructions, and information are unambiguous.
*   [ ] **Consistency:** Maintain a uniform design language (colors, typography, components, patterns) across the entire static page.
*   [ ] **Opinionated Design (Thoughtful Defaults):** Establish clear and simple visualization. Trying to avoid having too much to scroll. Everything in one place as much as possible.

## II. Design System Foundation (Tokens & Core Components)

* [ ] **Primary Brand Color:** `#69B3A2` – used for links, buttons and highlights.
* [ ] **Secondary Brand Color (Dark accent):** `#251667` – appears on link hovers and active brand text.
* [ ] **Dark Neutral:** `#212529` – used for backgrounds of icons and social buttons, offering contrast against lighter elements.
* [ ] **Highlight / Warm Accent:** `#FED136` – a golden yellow used on timeline markers and button hovers.
* [ ] **Light Neutral:** `#E9ECEF` – very light gray used for timelines and borders.
* [ ] **Very Light Neutral:** `#F2F2F2` – used for carousel caption text.
* [ ] **Magenta Gradient:** `#FF007F` → `#F01CF3` – gradient used in the promotional banner.
* [ ] **Red:** CSS uses plain `red` for some text labels (e.g., the “NumCat” identifier).
* [ ] **Orange:** used for card titles.
* [ ] **Other Tokens:** standard neutrals like `#FFFFFF` (white), `#CCC` (light grey) and black text/backgrounds appear throughout the CSS.
* [ ] **Opacity & RGBA:** several elements use semi‑transparent colors, such as `rgba(254,209,55,0.5)` for box shadows and `rgba(0,0,0,0.8)` for hover overlays.
* [ ] **Neutrals Scale:** Create a scale of grays (e.g., `#FFFFFF` → `#F2F2F2` → `#E9ECEF` → `#CCCCCC` → `#212529`) for backgrounds, borders and text.
* [ ] **Semantic Colors:** the existing palette can be extended with clear success, warning and error colors (e.g., green for success, amber for warning, red for destructive actions) to improve clarity for interactive components.
* [ ] **Accessibility Check:** verify that the combinations above meet WCAG AA contrast guidelines. For example, the primary teal (`#69B3A2`) on a white background provides sufficient contrast, while the magenta gradient should be used sparingly and paired with high‑contrast text.
* [ ] **Dark Mode:** derive a dark‑mode palette by inverting neutrals (e.g., use `#212529` as the base background with `#69B3A2` and `#FED136` as accents) to maintain brand identity while ensuring readability.

## III. Layout, Visual Hierarchy & Structure

*   [ ] **Responsive Grid System:** Design based on a responsive grid (e.g., 12-column)
*   [ ] **Strategic White Space:** Use ample negative space to improve clarity, reduce cognitive load, and create visual balance.
*   [ ] **Clear Visual Hierarchy:** Guide the user's eye using typography (size, weight, color), spacing, and element positioning.
*   [ ] **Consistent Alignment:** Maintain consistent alignment of elements.

## IV. CSS & Styling Architecture

*   [ ] **Choose a Scalable CSS Methodology:**
    *   [ ] **Utility-First (Recommended for LLM):** e.g., Tailwind CSS. Define design tokens in config, apply via utility classes.
    *   [ ] **BEM with Sass:** If not utility-first, use structured BEM naming with Sass variables for tokens.
    *   [ ] **CSS-in-JS (Scoped Styles):** e.g., Stripe's approach for Elements.
*   [ ] **Integrate Design Tokens:** Ensure colors, fonts, spacing, radii tokens are directly usable in the chosen CSS architecture.
*   [ ] **Maintainability & Readability:** Code should be well-organized and easy to understand.
*   [ ] **Performance:** Optimize CSS delivery; avoid unnecessary bloat.
