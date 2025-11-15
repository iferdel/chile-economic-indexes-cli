# Visualization Design Command

You are helping design and implement data visualizations for Chilean economic indicators.

## Context Files
- Design principles: `.claude/context/design-principles.md`
- Style guide: `.claude/context/style-guide.md`

## Technology Stack
- **Frontend**: Vanilla JavaScript or D3.js/Chart.js
- **Data Source**: `/api/sets/{set}` endpoint returns JSON
- **Deployment**: Embedded in Go binary from `public/` folder

## Visualization Best Practices

### Economic Time Series
1. **Line Charts** (primary for time series):
   - Reference: https://www.data-to-viz.com/graph/line.html
   - Use for employment trends over time
   - Show multiple series with distinct colors from brand palette
   - Include proper axis labels with units
   - Add tooltips for precise values

2. **Bar Charts** (for comparisons):
   - Reference: https://www.data-to-viz.com/graph/barplot.html
   - Use for regional comparisons
   - Maintain consistent color scheme
   - Sort by value when logical

3. **Area Charts** (for stacked categories):
   - Reference: https://www.data-to-viz.com/graph/area.html
   - Show cumulative trends
   - Use opacity for overlapping areas

### Design Requirements
- **Colors**: Use brand palette from design-principles.md
  - Primary: `#69B3A2`
  - Secondary: `#251667`
  - Highlight: `#FED136`
- **Responsive**: Mobile-first, test at 320px, 768px, 1440px viewports
- **Accessibility**:
  - WCAG AA contrast ratios
  - Keyboard navigation
  - Screen reader labels
- **Performance**:
  - Lazy load heavy visualizations
  - Debounce resize handlers
  - Use canvas for >1000 data points

### Data Handling
- Parse dates correctly from BCCh API format
- Handle missing data gracefully (show gaps, don't interpolate)
- Display loading states during API calls
- Show error messages for failed requests

## Process
1. Fetch data from `/api/sets/EMPLOYMENT` (or other set)
2. Transform API response to chart-ready format
3. Select appropriate chart type based on data structure
4. Apply brand styles and best practices
5. Implement responsive behavior
6. Add interactivity (tooltips, zoom, filters)

## Testing Checklist
- [ ] Data loads correctly from API
- [ ] Charts render on different viewport sizes
- [ ] Colors match brand palette
- [ ] Tooltips show accurate values
- [ ] No console errors
- [ ] Accessible via keyboard
- [ ] Loading/error states work

When implementing, always reference the specific chart type guide from data-to-viz.com and apply the brand design tokens.
