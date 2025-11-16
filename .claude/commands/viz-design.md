# Visualization Design Command

You are helping design and implement **professional-grade** data visualizations for Chilean economic indicators.

## Context Files (Auto-Loaded)
- **Design principles**: `.claude/context/design-principles.md`
- **Style guide**: `.claude/context/style-guide.md`
- **Knowledge base**: `.claude/context/viz-knowledge-base.md`
- **Examples library**: `.claude/context/viz-examples.md`
- **Python static charts**: `.claude/context/viz-python-static.md`
- **Curation guide**: `.claude/context/content-curation-guide.md`

## Technology Stack Options

### Option A: Web Interactive (Current Default)
- **Frontend**: Chart.js (simple) or D3.js (complex custom viz)
- **Data Source**: REST API endpoint `/api/sets/{set}` returns JSON
- **Deployment**: Static files in `public/` folder, embedded in Go binary
- **Use cases**: Dashboards, exploration, real-time updates

### Option B: Static Images (Python + Matplotlib)
- **Generator**: Python scripts using matplotlib
- **Output**: PNG/SVG files + HTML gallery
- **Deployment**: Files in `output/` directory
- **Use cases**: Reports, presentations, print, archival
- **See**: `.claude/context/viz-python-static.md` for patterns

### Option C: Hybrid (Best of Both Worlds)
- Generate static charts for reports/presentations
- Serve interactive web dashboard for exploration

## Decision: Static vs Interactive

**Choose Static (Python/matplotlib) if**:
✓ Creating charts for PDF reports
✓ Need print-quality output (300+ DPI)
✓ Charts for email/PowerPoint presentations
✓ Offline viewing required
✓ Consistent rendering across all platforms
✓ Archival/documentation purposes

**Choose Interactive (Web) if**:
✓ Building a live dashboard
✓ Users need to explore data (zoom, filter, drill-down)
✓ Real-time or frequently updated data
✓ Mobile responsive interface needed
✓ Sharing via URL
✓ Want to embed in web application

## Workflow: Building Interactive Web Viz

### Step 1: Understand the Data
```bash
# First, examine the data structure
curl http://localhost:49966/api/sets/EMPLOYMENT | jq

# Understand:
# - How many series?
# - Time range?
# - Granularity (monthly, quarterly)?
# - Any missing data?
```

### Step 2: Select Chart Type
Use the **decision tree** from `viz-knowledge-base.md`:

```
Is this time series data?
  → YES: Line chart (or area if stacked)
  → NO: ↓

Is this categorical comparison?
  → YES: Bar chart (horizontal if long labels)
  → NO: ↓

Is this geographic data?
  → YES: Choropleth map
  → NO: Check viz-examples.md for alternatives
```

**Reference the examples library** for code patterns.

### Step 3: Check Examples
Look in `viz-examples.md` for similar use cases:
- Example 1: Single time series with annotations
- Example 2: Multiple series comparison
- Example 3: Regional bar chart
- Example 4: Choropleth map
- Example 5: Small multiples grid
- Example 6: Interactive tooltips
- Example 7: Accessibility patterns

### Step 4: Implement with Best Practices

**Required elements**:
1. ✅ **Clear title**: Specific, includes time period
2. ✅ **Axis labels**: With units
3. ✅ **Legend**: Only if needed (prefer direct labeling)
4. ✅ **Tooltips**: Rich context (value, change, comparison)
5. ✅ **Responsive**: Mobile-first design
6. ✅ **Accessible**: Keyboard nav, ARIA labels, colorblind-safe
7. ✅ **Loading state**: Skeleton or spinner
8. ✅ **Error handling**: User-friendly messages

**Brand colors** (from design-principles.md):
```javascript
const brandColors = {
  primary: '#69B3A2',      // Main data color
  secondary: '#251667',    // Accent/borders
  highlight: '#FED136',    // Emphasis/events
  neutral: '#E9ECEF',      // Backgrounds/grids
  text: '#212529'          // Typography
};
```

### Step 5: Test Comprehensively

**Browser testing**:
```javascript
// Viewports to test
const viewports = [
  { width: 320, name: 'Mobile' },
  { width: 768, name: 'Tablet' },
  { width: 1440, name: 'Desktop' }
];
```

**Checklist** (from viz-knowledge-base.md):
- [ ] Chart type matches data characteristics?
- [ ] All axes properly labeled with units?
- [ ] Colors from brand palette + colorblind-safe?
- [ ] Tooltips show contextual information?
- [ ] Responsive at 320px, 768px, 1440px?
- [ ] Keyboard navigable (tab through elements)?
- [ ] No console errors?
- [ ] Loads in <2 seconds?
- [ ] Handles missing data gracefully?
- [ ] Error states tested?

### Step 6: Get Design Review (Optional)
For complex visualizations, use:
```bash
# Invoke viz-review agent
@agent viz-review "Review the employment dashboard at http://localhost:49966"
```

## Workflow: Building Static Python Charts

### Step 1: Define Requirements
```
What charts do you need?
- For reports: Single high-quality images
- For presentations: Multiple charts with consistent styling
- For archival: SVG format for scalability
```

### Step 2: Select Chart Patterns
Refer to `viz-python-static.md` for:
- Pattern 1: Time series with professional styling
- Pattern 2: Regional comparison bar chart
- Pattern 3: Small multiples grid

### Step 3: Implement Python Script
```python
# scripts/generate_employment_charts.py
from chart_generators import (
    create_employment_trend,
    create_regional_comparison,
    create_regional_grid
)

# Brand colors (consistent with web)
BRAND_COLORS = {
    'primary': '#69B3A2',
    'secondary': '#251667',
    'highlight': '#FED136',
    'neutral': '#E9ECEF',
    'text': '#212529'
}

# Generate charts...
```

### Step 4: Integrate with Go CLI
```go
// Call Python from Go
pythonCmd := exec.Command(
    "python3", "scripts/generate_charts.py",
    "--set", setName,
    "--output-dir", "./output/employment",
    "--format", "png",  // or "svg"
)
```

### Step 5: Quality Check
```
- [ ] DPI >= 150 (300 for print)
- [ ] Brand colors applied correctly
- [ ] Clean spines (top/right removed)
- [ ] Professional typography
- [ ] Proper date formatting
- [ ] File size reasonable (<2MB per chart)
- [ ] HTML gallery generated
```

## Common Economic Viz Patterns

### Pattern 1: Time Series Dashboard
```javascript
// Multiple line charts showing different indicators
// Layout: Grid of 2x2 or 3x2 charts
// Each chart: Same time range, different metric
// Synchronized zoom/pan

// Example metrics:
// - Employment rate (%)
// - Workforce participation (%)
// - Unemployment rate (%)
// - Job creation (absolute numbers)
```

### Pattern 2: Regional Comparison
```javascript
// Horizontal bar chart + choropleth map
// Layout: Side-by-side
// Interaction: Click region on map → highlight on chart
// Sort: By value (descending) or geographic order

// Show:
// - Current value per region
// - National average line
// - Deviation from average
```

### Pattern 3: Trend + Breakdown
```javascript
// Top: Line chart showing aggregate trend
// Bottom: Stacked area showing composition
// Interaction: Brush on top chart → zoom bottom chart

// Example:
// Top: Total employment over time
// Bottom: Employment by sector (stacked area)
```

## WebFetch Integration

If you need guidance not in the examples library:

```javascript
// Use WebFetch to get specific chart guidance
WebFetch({
  url: "https://www.data-to-viz.com/graph/ridgeline.html",
  prompt: `Extract:
    1. When to use ridgeline plots
    2. Best practices for economic data
    3. Implementation tips
    Format as concise markdown.`
})
```

**Priority URLs** (from curation guide):
- Line: https://www.data-to-viz.com/graph/line.html
- Bar: https://www.data-to-viz.com/graph/barplot.html
- Area: https://www.data-to-viz.com/graph/area.html
- Choropleth: https://www.data-to-viz.com/graph/choropleth.html
- Anti-patterns: https://www.data-to-viz.com/caveat/pie.html

## Quick Reference: Chart.js Starter

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chilean Employment Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8f9fa;
    }
    .chart-container {
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    canvas {
      max-height: 400px;
    }
  </style>
</head>
<body>
  <div class="chart-container">
    <canvas id="employmentChart"></canvas>
  </div>

  <script>
    // Fetch data from API
    fetch('/api/sets/EMPLOYMENT')
      .then(res => res.json())
      .then(data => {
        // Transform API response to Chart.js format
        const chartData = transformData(data);

        // Create chart
        const ctx = document.getElementById('employmentChart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
              title: {
                display: true,
                text: 'Employment Rate by Region, 2020-2024',
                font: { size: 16, weight: 'bold' }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: (context) => {
                    return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                title: { display: true, text: 'Employment Rate (%)' }
              },
              x: {
                title: { display: true, text: 'Month' }
              }
            }
          }
        });
      })
      .catch(error => {
        console.error('Error loading data:', error);
        // Show user-friendly error
      });

    function transformData(apiResponse) {
      // Transform logic here
      return {
        labels: [...],
        datasets: [...]
      };
    }
  </script>
</body>
</html>
```

## Anti-Patterns to Avoid

Refer to `viz-knowledge-base.md` for full list. Key ones:

❌ **Pie charts** for economic comparisons (use bars)
❌ **Truncated axes** without clear justification
❌ **Dual Y-axes** with manipulated scales
❌ **Rainbow colors** (use sequential or diverging)
❌ **3D effects** (distorts perception)
❌ **Too many series** (>8 without filtering)

## Economic Data Conventions

From `viz-knowledge-base.md`:

- **Employment/Unemployment**: % of labor force
- **GDP**: Quarterly growth rate (YoY or QoQ)
- **Inflation**: Year-over-year % change
- **Regional data**: Normalize per capita
- **Baselines**: Show national average or pre-crisis level
- **Events**: Annotate policy changes, crises

## When to Use D3.js vs Chart.js vs Matplotlib

**Use Chart.js when**:
- Standard chart types (line, bar, area, scatter)
- Quick web implementation needed
- Responsive out-of-the-box
- Simple interactions
- **Output**: Interactive web dashboard

**Use D3.js when**:
- Custom, non-standard web visualizations
- Complex interactions (brushing, zooming, linking)
- Geographic maps (with TopoJSON)
- Need fine-grained control
- **Output**: Interactive web dashboard

**Use Matplotlib (Python) when**:
- Need static image files (PNG, SVG, PDF)
- Creating charts for reports/presentations
- Print-quality output required (300 DPI)
- Offline viewing
- Batch generation of many charts
- **Output**: Static image files

**Examples in viz-examples.md** show Chart.js/D3.js patterns.
**Examples in viz-python-static.md** show matplotlib patterns.

## Final Reminder

🎯 **Goal**: Create visualizations that:
1. **Inform**: Clear insights at a glance
2. **Engage**: Interactive (web) or polished (static)
3. **Accessible**: Everyone can use them
4. **Trustworthy**: Accurate, not misleading
5. **Beautiful**: Professional brand-aligned design

**For interactive web viz**: Refer to examples library and knowledge base
**For static charts**: Refer to viz-python-static.md
**For edge cases**: Use WebFetch to check data-to-viz.com
**For comprehensive review**: Invoke viz-review agent
