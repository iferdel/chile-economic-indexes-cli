Objective
- Align the entire static page (not just charts) to the style in @.claude/context/style-guide.md.

Source of truth
- ONLY use the links and guidance inside @.claude/context/style-guide.md.
- Ignore any other references.

Scope (page-level first)
- Page composition: grid, columns, gutters, section spacing, vertical rhythm, breakpoints.
- Typographic system: heading hierarchy, ramp/scale, line-length, line-height, caption and footnote styles.
- Inter-chart elements: titles, subtitles, notes, legends, filters/controls, footnotes, source lines.
- Chart containers: padding, margins, legend placement, annotation style, responsive behavior.
- Charts themselves should keep their intent; adjust styling/structure only as needed to match the reference look.

Tasks
1) Audit current page
   - Identify issues in layout hierarchy, spacing, type scale, legend/annotation placement, and responsiveness.
2) Extract reference rules
   - From the matching reference(s) in the style guide, list concrete rules/patterns (layout grid, spacing scale, typographic sizes, annotation/legend patterns, example D3 patterns if present).
3) Redesign (page-first)
   - Apply a consistent grid and spacing scale.
   - Normalize headings, captions, and explanatory text to the reference’s hierarchy.
   - Standardize legend placement, annotation style, and footnote/source formatting across charts.
   - Keep existing chart types unless a clearer encoding is strongly indicated by the style guide.
4) Implement
   - Update HTML structure/CSS tokens and D3 selectors as needed (no new libraries).
   - Ensure responsive layout across desktop/tablet; fix overflow and axis/legend wrapping.
   - Meet basic a11y: semantic headings, label associations, focus order, and WCAG contrast.
5) Evidence
   - Provide before/after screenshots.
   - A mapping table: {section_or_chart_id | chosen_reference_link(s) | applied rules | code diffs/rationale}.

Deliverables
- Updated HTML/CSS/D3 aligned to the reference.
- A short README listing: grid/spacing scale, type ramp, legend/annotation patterns, and any trade-offs.

Constraints
- Do NOT alter data semantics.
- Do NOT use sources outside @.claude/context/style-guide.md.
- Preserve repo structure unless a change is essential (document any such change).

Acceptance criteria
- Page-level composition matches the reference (grid, spacing, type scale, legend/annotation patterns).
- Charts render responsively with consistent inter-chart treatments.
- Clear headings/captions/footnotes; a11y checks pass.

Keywords
page-level composition, grid system, spacing scale, vertical rhythm, typographic ramp, legend placement, annotation style, responsive layout, D3 structure, accessibility, WCAG contrast, consistency, reference-driven.
