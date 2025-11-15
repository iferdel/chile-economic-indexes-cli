# Visualization Examples Library

## Time Series Line Charts

### Example 1: Single Series with Annotations
**Use Case**: Showing employment rate over time with policy interventions
**Source**: https://www.data-to-viz.com/graph/line.html

**Key Principles**:
```
✓ Start Y-axis at meaningful baseline (not zero for rates/percentages)
✓ Add vertical lines or shaded regions for important events
✓ Use smooth curves for monthly data, points + lines for quarterly
✓ Include trend line if long-term pattern is relevant
✗ Don't connect gaps in data (show breaks instead)
✗ Don't use more than 4-5 colors without other differentiators
```

**Data-to-Viz Guidance**:
> "A line chart displays the evolution of one or several numeric variables. Data points are connected by straight line segments. It is similar to a scatter plot except that the measurement points are ordered (typically by their x-axis value) and joined with straight line segments."

**When to Use**:
- Continuous data over time (monthly, quarterly, annual)
- Showing trends and patterns
- Comparing 2-4 related series

**Implementation Pattern** (Chart.js):
```javascript
{
  type: 'line',
  data: {
    labels: dateLabels,  // ['2020-01', '2020-02', ...]
    datasets: [{
      label: 'Employment Rate (%)',
      data: values,
      borderColor: '#69B3A2',
      backgroundColor: 'rgba(105, 179, 162, 0.1)',
      fill: false,
      tension: 0.2,  // Slight smoothing
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: {
    responsive: true,
    aspectRatio: 2.5,  // Wide for time series
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Employment Rate (%)' }
      }
    },
    plugins: {
      annotation: {
        annotations: {
          policyChange: {
            type: 'line',
            xMin: '2022-06',
            xMax: '2022-06',
            borderColor: '#FED136',
            borderWidth: 2,
            label: { content: 'Policy Reform', enabled: true }
          }
        }
      }
    }
  }
}
```

**D3.js Alternative** (for custom needs):
```javascript
// Margin convention
const margin = {top: 20, right: 30, bottom: 30, left: 60};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Scales
const x = d3.scaleTime()
  .domain(d3.extent(data, d => d.date))
  .range([0, width]);

const y = d3.scaleLinear()
  .domain([d3.min(data, d => d.value) - 1, d3.max(data, d => d.value) + 1])
  .range([height, 0]);

// Line generator
const line = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.value))
  .curve(d3.curveMonotoneX);  // Smooth interpolation
```

---

### Example 2: Multiple Series Comparison
**Use Case**: Comparing employment across regions
**Source**: https://www.data-to-viz.com/graph/line.html#multiple

**Key Principles**:
```
✓ Use distinct colors from brand palette
✓ Direct labeling (end of line) instead of legend when possible
✓ Highlight one series to tell a story, fade others
✓ Interactive show/hide for >5 series
✗ Don't use more than 8 series without filtering
✗ Don't cross lines unnecessarily (reorder by final value)
```

**Matplotlib Equivalent**:
```python
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

fig, ax = plt.subplots(figsize=(12, 6))

# Plot each region
for region, data in regions.items():
    ax.plot(data['date'], data['employment'],
            label=region, linewidth=2, alpha=0.8)

# Formatting
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
ax.xaxis.set_major_locator(mdates.MonthLocator(interval=3))
ax.set_ylabel('Employment Rate (%)', fontsize=12)
ax.set_title('Regional Employment Comparison, 2020-2024',
             fontsize=14, fontweight='bold')
ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
ax.grid(True, alpha=0.3)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

plt.tight_layout()
```

---

## Bar Charts (Comparisons)

### Example 3: Regional Comparison Bar Chart
**Use Case**: Comparing employment rates across Chilean regions
**Source**: https://www.data-to-viz.com/graph/barplot.html

**Key Principles**:
```
✓ Sort by value (descending) unless geography/category matters
✓ Use horizontal bars for long labels (region names)
✓ Start at zero (bars encode length, must be accurate)
✓ Add value labels on bars for precision
✓ Highlight national average or reference value
✗ Don't use 3D bars (distorts perception)
✗ Don't use too many colors (one color with highlight works)
```

**Data-to-Viz Guidance**:
> "A barplot shows the relationship between a numeric and a categoric variable. Each entity of the categoric variable is represented as a bar. The size of the bar represents its numeric value."

**When to Use**:
- Comparing categories (regions, sectors, demographics)
- Discrete data (not continuous time series)
- Emphasis on individual values rather than trends

**Implementation Pattern** (Chart.js):
```javascript
{
  type: 'bar',
  data: {
    labels: regionNames,  // ['Metropolitana', 'Valparaíso', ...]
    datasets: [{
      label: 'Employment Rate by Region',
      data: employmentRates,
      backgroundColor: regions.map(r =>
        r === 'National Average' ? '#FED136' : '#69B3A2'
      ),
      borderColor: '#251667',
      borderWidth: 1
    }]
  },
  options: {
    indexAxis: 'y',  // Horizontal bars
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {  // Requires chartjs-plugin-datalabels
        anchor: 'end',
        align: 'end',
        formatter: (value) => value.toFixed(1) + '%'
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Employment Rate (%)' }
      }
    }
  }
}
```

**Matplotlib Equivalent**:
```python
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(10, 8))

# Sort data by value
sorted_data = sorted(zip(regions, employment_rates),
                     key=lambda x: x[1], reverse=True)
regions_sorted, rates_sorted = zip(*sorted_data)

# Create bars
colors = ['#FED136' if r == 'National Avg' else '#69B3A2'
          for r in regions_sorted]
bars = ax.barh(regions_sorted, rates_sorted, color=colors,
               edgecolor='#251667', linewidth=1.5)

# Add value labels
for i, (bar, value) in enumerate(zip(bars, rates_sorted)):
    ax.text(value + 0.5, i, f'{value:.1f}%',
            va='center', fontsize=10)

# Formatting
ax.set_xlabel('Employment Rate (%)', fontsize=12)
ax.set_title('Employment Rate by Region, Q4 2024',
             fontsize=14, fontweight='bold')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.set_xlim(0, 100)

plt.tight_layout()
```

---

## Choropleth Maps (Geographic Data)

### Example 4: Regional Employment Map
**Use Case**: Visualizing employment across Chilean regions geographically
**Source**: https://www.data-to-viz.com/graph/choropleth.html

**Key Principles**:
```
✓ Use sequential color scale for single metric
✓ Use diverging scale for deviation from average
✓ Include legend with clear bins/thresholds
✓ Normalize by population (rates, not absolute numbers)
✓ Handle missing data explicitly (gray or pattern)
✗ Don't use rainbow colors (hard to interpret)
✗ Don't use too many bins (5-7 is optimal)
```

**Data-to-Viz Guidance**:
> "A choropleth map displays divided geographical areas colored in relation to a numeric variable. It allows to study how a variable evolves along a territory."

**When to Use**:
- Geographic patterns are important to the story
- Data is available for all regions
- Regional boundaries are meaningful to audience

**Implementation Pattern** (D3.js + TopoJSON):
```javascript
// Load map and data
Promise.all([
  d3.json('chile-regions.topojson'),
  d3.json('/api/sets/EMPLOYMENT')
]).then(([topology, employmentData]) => {

  // Color scale
  const colorScale = d3.scaleSequential()
    .domain([85, 100])  // Employment rate range
    .interpolator(d3.interpolateGreens);

  // Create map
  const svg = d3.select('#map')
    .append('svg')
    .attr('viewBox', '0 0 800 1000');

  const projection = d3.geoMercator()
    .center([-71, -35])  // Chile center
    .scale(2000);

  const path = d3.geoPath().projection(projection);

  // Draw regions
  svg.selectAll('path')
    .data(topojson.feature(topology, topology.objects.regions).features)
    .join('path')
    .attr('d', path)
    .attr('fill', d => {
      const rate = employmentData[d.properties.name];
      return rate ? colorScale(rate) : '#ccc';
    })
    .attr('stroke', '#251667')
    .attr('stroke-width', 1)
    .on('mouseover', function(event, d) {
      // Show tooltip
    });

  // Add legend
  const legend = svg.append('g')
    .attr('transform', 'translate(650, 50)');

  // ... legend implementation
});
```

**Matplotlib Alternative** (using GeoPandas):
```python
import geopandas as gpd
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

# Load shapefile
chile_regions = gpd.read_file('chile_regions.shp')

# Merge with employment data
chile_regions = chile_regions.merge(employment_df,
                                     left_on='region_name',
                                     right_on='region')

# Create custom colormap
colors = ['#E5F5E0', '#69B3A2', '#251667']
cmap = LinearSegmentedColormap.from_list('custom', colors)

# Plot
fig, ax = plt.subplots(figsize=(8, 12))
chile_regions.plot(column='employment_rate',
                   cmap=cmap,
                   linewidth=0.8,
                   edgecolor='#251667',
                   legend=True,
                   legend_kwds={'label': 'Employment Rate (%)',
                                'orientation': 'horizontal'},
                   missing_kwds={'color': 'lightgrey'},
                   ax=ax)

ax.set_title('Employment Rate by Region, 2024',
             fontsize=16, fontweight='bold')
ax.axis('off')

plt.tight_layout()
```

---

## Small Multiples (Faceted Charts)

### Example 5: Regional Time Series Grid
**Use Case**: Comparing time series across multiple regions simultaneously
**Source**: https://www.data-to-viz.com/graph/line.html#smallmultiple

**Key Principles**:
```
✓ Use same scale across all facets (for comparability)
✓ Arrange in logical order (geographic, alphabetic, or by metric)
✓ Keep titles/labels minimal (no redundancy)
✓ Highlight patterns that differ from norm
✗ Don't use different scales unless explicitly noted
✗ Don't exceed 12-16 facets (becomes overwhelming)
```

**Matplotlib Implementation**:
```python
import matplotlib.pyplot as plt

regions = ['Metropolitana', 'Valparaíso', 'Biobío',
           'Araucanía', 'Los Lagos', 'Maule']

fig, axes = plt.subplots(2, 3, figsize=(15, 10), sharey=True)
axes = axes.flatten()

# Global y-axis limits
y_min = min([df['employment'].min() for df in region_data.values()])
y_max = max([df['employment'].max() for df in region_data.values()])

for i, region in enumerate(regions):
    ax = axes[i]
    data = region_data[region]

    ax.plot(data['date'], data['employment'],
            color='#69B3A2', linewidth=2)

    # Add national average for reference
    ax.axhline(national_avg, color='#FED136',
               linestyle='--', linewidth=1, alpha=0.7)

    ax.set_title(region, fontsize=12, fontweight='bold')
    ax.set_ylim(y_min - 1, y_max + 1)
    ax.grid(True, alpha=0.3)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    if i >= 3:  # Bottom row
        ax.set_xlabel('Year', fontsize=10)
    if i % 3 == 0:  # Left column
        ax.set_ylabel('Employment Rate (%)', fontsize=10)

fig.suptitle('Regional Employment Trends, 2020-2024',
             fontsize=16, fontweight='bold')
plt.tight_layout()
```

---

## Interactive Tooltips & Legends

### Example 6: Rich Tooltips for Economic Data
**Key Principles**:
```
✓ Show absolute value + context (change from previous, YoY)
✓ Format numbers appropriately (1.2M not 1234567)
✓ Use consistent date format
✓ Keep tooltip concise but informative
```

**Chart.js Custom Tooltip**:
```javascript
plugins: {
  tooltip: {
    callbacks: {
      title: function(context) {
        // Format date nicely
        const date = new Date(context[0].label);
        return date.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long'
        });
      },
      label: function(context) {
        const value = context.parsed.y;
        const prevValue = getPreviousValue(context.dataIndex);
        const change = value - prevValue;
        const changeSymbol = change >= 0 ? '+' : '';

        return [
          `Employment: ${value.toFixed(1)}%`,
          `Change: ${changeSymbol}${change.toFixed(2)}%`,
          `vs. National: ${(value - nationalAvg).toFixed(1)}%`
        ];
      },
      labelColor: function(context) {
        return {
          borderColor: context.dataset.borderColor,
          backgroundColor: context.dataset.borderColor,
          borderWidth: 2
        };
      }
    }
  }
}
```

---

## Accessibility Patterns

### Example 7: Screen Reader & Keyboard Navigation
**Key Principles**:
```
✓ Provide text alternative/summary
✓ Use ARIA labels for interactive elements
✓ Ensure keyboard navigation works
✓ Don't rely solely on color (use patterns/shapes)
```

**Implementation**:
```html
<div role="img" aria-label="Line chart showing employment rate from 90% in 2020 to 95% in 2024, with notable dip during pandemic">
  <canvas id="employmentChart"></canvas>
</div>

<!-- Provide data table as alternative -->
<details>
  <summary>View data table</summary>
  <table>
    <thead>
      <tr><th>Date</th><th>Employment Rate</th></tr>
    </thead>
    <tbody>
      <!-- Data rows -->
    </tbody>
  </table>
</details>
```

**Color Accessibility**:
```javascript
// Use colorblind-safe palette
const colorBlindSafe = {
  blue: '#0173B2',
  orange: '#DE8F05',
  green: '#029E73',
  red: '#CC78BC',
  // From Wong (2011) Nature Methods
};

// Add patterns for additional differentiation
const patterns = {
  solid: null,
  dashed: [5, 5],
  dotted: [2, 2],
  dashdot: [10, 5, 2, 5]
};
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Misleading Axes
```
❌ BAD: Bar chart with Y-axis starting at 90 (exaggerates differences)
✓ GOOD: Bar chart starting at 0 + annotation noting narrow range

❌ BAD: Dual Y-axes with manipulated scales showing false correlation
✓ GOOD: Two separate charts or normalized to same scale

❌ BAD: Logarithmic scale without clear labeling
✓ GOOD: Explicit "Log Scale" label + explanation why used
```

### Pitfall 2: Too Much Data
```
❌ BAD: 50 lines on one chart (spaghetti chart)
✓ GOOD: Small multiples or interactive filtering

❌ BAD: Pie chart with 15 slices
✓ GOOD: Bar chart showing top 10 + "Other"

❌ BAD: Scatterplot with 100k points (all overlap)
✓ GOOD: 2D density plot or hexbin map
```

### Pitfall 3: Chart Junk
```
❌ BAD: 3D effects, gradients, shadows, textures
✓ GOOD: Flat design with purposeful use of color

❌ BAD: Decorative icons and images obscuring data
✓ GOOD: Annotations adding context, not decoration

❌ BAD: Grid lines every unit
✓ GOOD: Subtle grid at major intervals only
```

---

## Decision Matrix

```
Data Characteristics → Chart Type

Time Series (continuous):
  - Single metric → Line chart
  - Multiple metrics (2-5) → Multi-line chart
  - Multiple metrics (6+) → Small multiples or interactive filter
  - With forecast → Line + shaded confidence interval

Categorical Comparison:
  - Few categories (<7) → Bar chart
  - Many categories (7-15) → Horizontal bar (sorted)
  - Many categories (15+) → Lollipop chart or treemap
  - Part-to-whole → Stacked bar or treemap (NOT pie)

Distribution:
  - Single → Histogram or density plot
  - Multiple → Ridgeline or violin plot
  - With outliers → Box plot (with explanation)

Geographic:
  - Continuous metric → Choropleth map
  - Point data → Bubble map
  - Flow data → Sankey or arc diagram

Correlation:
  - Two variables → Scatter plot
  - Multiple variables → Scatter plot matrix or correlogram
  - Over time → Connected scatter plot
```
