# Professional Visualization Knowledge Base

## Decision Tree for Chart Selection

### Time Series Data (Employment, GDP, Inflation)
```
Has seasonal patterns?
  → YES: Use small multiples or faceted line charts
  → NO: Simple line chart with trend line

Multiple series to compare?
  → 2-4 series: Multi-line chart with distinct colors
  → 5+ series: Consider small multiples or interactive filtering

Need to show cumulative effect?
  → YES: Stacked area chart
  → NO: Line chart with separate y-axes if scales differ significantly
```

**Key Principles**:
- Always start at zero for absolute values
- Can start at non-zero for rates of change/indices
- Show data points for monthly/quarterly data
- Use lines only for continuous data
- Add confidence intervals for forecasts

**Reference**: https://www.data-to-viz.com/graph/line.html

### Regional Comparisons (Employment by Region)
```
Few regions (<10)?
  → Bar chart (horizontal if labels are long)

Many regions (10+)?
  → Consider choropleth map OR grouped/sorted bars

Need to show ranking?
  → Lollipop chart (cleaner than bars)

Multiple metrics per region?
  → Small multiples or grouped bars
```

**Key Principles**:
- Sort by value unless geographic/alphabetical order matters
- Use consistent color scheme
- Highlight national average or reference line
- Consider population-adjusted metrics

**References**:
- Barplot: https://www.data-to-viz.com/graph/barplot.html
- Lollipop: https://www.data-to-viz.com/graph/lollipop.html
- Choropleth: https://www.data-to-viz.com/graph/choropleth.html

### Distribution Analysis
```
Single distribution?
  → Histogram or density plot

Multiple distributions to compare?
  → Ridgeline plot or violin plot

Need to show outliers?
  → Box plot (but explain quartiles!)
```

**Reference**: https://www.data-to-viz.com/graph/histogram.html

## Anti-Patterns for Economic Data

### ❌ AVOID: Pie Charts for Economic Data
- **Why**: Hard to compare angles/areas accurately
- **Instead**: Use bar charts or treemaps
- **Reference**: https://www.data-to-viz.com/caveat/pie.html

### ❌ AVOID: Dual Y-Axes with Unrelated Scales
- **Why**: Can be manipulated to show misleading correlations
- **Instead**: Use small multiples or normalize to same scale
- **Example**: Don't show "Employment vs Ice Cream Sales" on same chart

### ❌ AVOID: 3D Charts
- **Why**: Perspective distorts values
- **Instead**: Use 2D with proper visual hierarchy

### ❌ AVOID: Truncated Y-Axis for Absolute Values
- **Why**: Exaggerates changes
- **When OK**: Explicitly showing rate of change or when range is very small relative to baseline

## Economic Data Conventions

### Unemployment/Employment
- **Standard**: Show as percentage of labor force
- **Time range**: Monthly or quarterly data
- **Baseline**: Include national average or pre-crisis level
- **Context**: Add recession shading or policy change markers

### Inflation (CPI)
- **Standard**: Year-over-year % change
- **Baseline**: Often 2% target line
- **Special**: Consider dual chart showing both index and rate of change

### GDP
- **Standard**: Quarterly annualized growth rate
- **Consideration**: Real vs nominal (always specify)
- **Context**: Add trend line or potential GDP estimate

### Regional Data
- **Normalization**: Per capita when comparing regions of different sizes
- **Geographic**: Consider choropleth maps for Chilean regions
- **Ranking**: Show both absolute and relative performance

## Typography & Annotation Best Practices

### Titles
- Clear, specific: "Monthly Employment Rate by Region, 2020-2024"
- Not: "Employment Chart"

### Axes
- Always include units: "(thousands of workers)", "(%)", "(CLP millions)"
- Format large numbers: 1.2M not 1,200,000
- Use consistent date formats: "Jan 2024" or "2024-01"

### Legends
- Order by final value (most important first)
- Use direct labeling when possible instead of legend
- Keep legend close to relevant data

### Annotations
- Highlight key events: "COVID-19 pandemic", "Policy change"
- Use arrows or vertical lines for specific dates
- Add context: "Pre-pandemic average: 7.2%"

## Color Scales for Economic Data

### Sequential (Single Metric)
- **Positive values**: Light to dark of single hue
- **Use brand colors**: `#69B3A2` (light) → `#251667` (dark)
- **Example**: Employment rate from low to high

### Diverging (Positive/Negative)
- **Center**: Zero or national average
- **Negative**: Reds/oranges
- **Positive**: Blues/greens
- **Example**: GDP growth (negative = recession, positive = expansion)

### Categorical (Regions/Groups)
- **Use distinct hues** from brand palette
- **Avoid**: Red/green only (colorblind accessibility)
- **Maximum**: 8 categories before needing other differentiators

### Reference
- ColorBrewer: https://colorbrewer2.org/
- Accessibility: Use patterns/textures in addition to color

## Interaction Patterns

### Tooltips (Essential)
```javascript
// Show on hover:
{
  "Date": "January 2024",
  "Employment Rate": "95.3%",
  "Change from prev month": "+0.2%",
  "Change YoY": "+1.5%"
}
```

### Filtering (For Multiple Series)
- Checkbox to show/hide regions
- Date range slider for time series
- Dropdown for metric selection

### Zooming (Time Series)
- Brush selection to zoom into date range
- Reset button to return to full view
- Maintain context: show minimap of full range

### Responsiveness
```
Desktop (>1024px): Show all series, full legend
Tablet (768-1024px): Reduce to 4-6 series, compact legend
Mobile (<768px): Show 2-3 key series, dropdown for others
```

## Implementation Examples

### Line Chart with Best Practices
```javascript
// Chart.js configuration for professional employment chart
{
  type: 'line',
  data: {
    labels: months,
    datasets: [{
      label: 'National Employment Rate',
      data: employmentData,
      borderColor: '#69B3A2',
      backgroundColor: 'rgba(105, 179, 162, 0.1)',
      tension: 0.1, // Slight curve, not too much
      pointRadius: 3, // Show data points
      pointHoverRadius: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5, // Wide format for time series
    plugins: {
      title: {
        display: true,
        text: 'Monthly Employment Rate, Chile 2020-2024',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Employment: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      },
      annotation: {
        annotations: {
          baseline: {
            type: 'line',
            yMin: 93.5,
            yMax: 93.5,
            borderColor: '#CCC',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: 'Pre-pandemic average',
              enabled: true
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false, // Employment rate doesn't start at 0
        min: 90,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        },
        title: {
          display: true,
          text: 'Employment Rate (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  }
}
```

## Quality Checklist

Before publishing any visualization:

- [ ] **Chart type**: Is this the best chart for this data?
- [ ] **Title**: Clear, specific, includes time period?
- [ ] **Axes**: Labeled with units? Appropriate scale?
- [ ] **Legend**: Necessary? Ordered logically?
- [ ] **Colors**: Accessible? Consistent with brand?
- [ ] **Annotations**: Key events highlighted?
- [ ] **Tooltips**: Show all relevant context?
- [ ] **Responsive**: Works on mobile (320px)?
- [ ] **Load time**: <2s to first render?
- [ ] **Accessibility**: Keyboard navigable? Screen reader labels?
- [ ] **Data**: Accurate? Source cited?

## Resources

### Core References
- **Data-to-Viz**: https://www.data-to-viz.com/ (chart selection)
- **Chart.js**: https://www.chartjs.org/ (implementation)
- **D3.js**: https://d3js.org/ (advanced custom viz)

### Deep Dives
- **Edward Tufte**: Visual Display of Quantitative Information
- **Stephen Few**: Show Me the Numbers
- **Alberto Cairo**: The Truthful Art

### Chilean Economic Data Context
- **BCCh Methodologies**: https://www.bcentral.cl/metodologias
- **OECD Chile**: https://data.oecd.org/chile.htm
