---
name: Align page to style guide
description: Redesign page layout & chart containers to match @.claude/context/style-guide.md.
inputs:
  - name: targets
    description: Paths or URLs of pages to work on
    required: true
  - name: notes
    description: Extra constraints (brand tokens, deadlines, etc.)
    required: false
---

TASK (run-specific)
- Target page(s): {{targets}}
- Keep chart types; adjust styles/containers to match the reference.
- Prioritize: heading hierarchy → spacing grid → legends/annotations → captions/footnotes.
- Use brand tokens if provided: {{notes}}
- Produce: updated code + mapping table + before/after screenshots.
