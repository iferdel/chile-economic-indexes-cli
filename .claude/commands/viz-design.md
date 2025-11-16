# Visualization Design Command

You are helping design and implement **professional-grade** data visualizations for Chilean economic indicators using a **hybrid browser toggle system**.

## Context Files (Auto-Loaded)
- **Design principles**: `.claude/context/design-principles.md`
- **Style guide**: `.claude/context/style-guide.md`
- **Knowledge base**: `.claude/context/viz-knowledge-base.md`
- **Examples library**: `.claude/context/viz-examples.md`
- **Python matplotlib (hybrid toggle)**: `.claude/context/viz-python-static.md`
- **Curation guide**: `.claude/context/content-curation-guide.md`

## Current Architecture: Hybrid Browser Toggle

The visualization system allows users to **toggle between two rendering engines** in the browser:

```
📊 Chart.js (Interactive) ←→ 🐍 Matplotlib (Python)
```

### How It Works
1. User runs `bcch viz`
2. Go server starts and:
   - Fetches BCCh API data
   - Generates matplotlib charts via `uv run` (Python)
   - Saves PNGs to `bcch/public/img/`
   - Serves hybrid HTML dashboard
3. Browser opens with BOTH versions:
   - Chart.js canvases (interactive, tooltips, zoom)
   - Matplotlib images (publication-quality, 300 DPI)
4. User clicks toggle to switch instantly (no reload)

### Key Benefits
✓ **Learn by comparison** - Switch between engines to see different approaches
✓ **Best of both worlds** - Interactive exploration + publication-quality export
✓ **Graceful fallback** - Works without Python (Chart.js only)
✓ **Brand consistent** - Same colors across both engines

## When to Work On Each Engine

### Chart.js (Interactive Web)

**Work on Chart.js when**:
- Adding interactivity (tooltips, zoom, filters)
- Real-time data updates
- Mobile responsive features
- Embedding in web applications
- User wants to explore data dynamically

**Files to modify**:
- `bcch/public/main.js` - Chart.js rendering logic
- `bcch/public/index.html` - Canvas elements
- `bcch/public/styles.css` - Styling

**References**: `viz-examples.md`, `viz-knowledge-base.md`

### Matplotlib (Publication Quality)

**Work on matplotlib when**:
- Adding visual polish for screenshots
- Customizing for print/reports (300 DPI)
- Learning matplotlib techniques (PLAYGROUND markers)
- Adding annotations or statistical overlays
- Experimenting with chart styles

**Files to modify**:
- `bcch/python/charts/unemployment.py`
- `bcch/python/charts/exchange.py`
- `bcch/python/charts/cpi.py`

**References**: `viz-python-static.md`

## Workflow: Enhancing Existing Charts

### For Chart.js Enhancements

**Step 1: Identify the chart**
```javascript
// In bcch/public/main.js
// Charts: unemploymentImacecChart, exchangeCopperChart, cpiComparisonChart
```

**Step 2: Modify Chart.js configuration**
```javascript
// Example: Add tooltip customization
tooltip: {
    mode: 'index',
    intersect: false,
    callbacks: {
        label: (context) => {
            const value = context.parsed.y;
            const prevValue = getPrevious(context.dataIndex);
            const change = value - prevValue;
            return [
                `${context.dataset.label}: ${value.toFixed(1)}%`,
                `Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
            ];
        }
    }
}
```

**Step 3: Test**
```bash
go run ./bcch viz
# Toggle to 📊 Chart.js
# Verify changes
```

### For Matplotlib Enhancements

**Step 1: Identify the chart module**
```bash
bcch/python/charts/
├── unemployment.py  # Unemployment + Imacec
├── exchange.py      # Exchange rate + Copper
└── cpi.py           # CPI comparison
```

**Step 2: Find PLAYGROUND markers**
```python
# In unemployment.py

# PLAYGROUND: Customize figure size and DPI
fig, ax1 = plt.subplots(figsize=(14, 7), dpi=100)

# PLAYGROUND: Brand colors
colors = {
    'primary': '#69B3A2',
    'secondary': '#251667',
    # Add your customizations here
}

# PLAYGROUND: Try different line styles
ax1.plot(dates, data,
         linewidth=2.5,     # Try: 1.5, 3.0
         linestyle='-',     # Try: '--', ':', '-.'
         marker='o',        # Try: 's', '^', 'D'
         alpha=0.9)         # Try: 0.5, 0.7
```

**Step 3: Make changes**
```python
# Example: Add COVID-19 annotation
pandemic = datetime(2020, 3, 1)
ax.axvline(pandemic, color='red', linestyle=':', alpha=0.6)
ax.text(pandemic, ax.get_ylim()[1], 'COVID-19\nPandemic',
        rotation=90, va='top', fontsize=9)
```

**Step 4: Test**
```bash
go run ./bcch viz
# Toggle to 🐍 Matplotlib
# Verify changes (may need to clear browser cache)
```

**Step 5: Compare**
```
Toggle between 📊 Chart.js and 🐍 Matplotlib
Ensure consistent storytelling across both
```

## Workflow: Adding New Charts

### Step 1: Define the Chart

**Questions to answer**:
- What data does it show?
- Which BCCh series IDs?
- What chart type? (line, bar, dual Y-axis, etc.)
- What story does it tell?

### Step 2: Implement in Both Engines

#### Option A: Chart.js First (Recommended)

1. **Add canvas to HTML**:
```html
<!-- In bcch/public/index.html -->
<div class="chart-container">
    <div class="chart-header">
        <h2>Your Chart Title</h2>
    </div>
    <!-- Chart.js Version -->
    <div class="chart-wrapper" data-engine="chartjs">
        <canvas id="yourChart"></canvas>
    </div>
    <!-- Matplotlib Version (will add later) -->
    <div class="chart-wrapper hidden" data-engine="matplotlib">
        <img src="img/your_chart.png" alt="Your Chart - Matplotlib" class="matplotlib-chart">
    </div>
</div>
```

2. **Add Chart.js logic**:
```javascript
// In bcch/public/main.js
function createYourChart(data) {
    const ctx = document.getElementById('yourChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Your Metric',
                data: data.values,
                borderColor: '#69B3A2',
                backgroundColor: 'rgba(105, 179, 162, 0.1)',
                // ... styling
            }]
        },
        options: {
            responsive: true,
            // ... configuration from viz-examples.md
        }
    });
}
```

3. **Test Chart.js version**:
```bash
go run ./bcch viz
# Toggle stays on 📊 Chart.js
# Verify it works
```

#### Option B: Add Matplotlib Version

1. **Create chart module**:
```bash
# Create new file
touch bcch/python/charts/your_chart.py
```

2. **Implement following pattern**:
```python
# bcch/python/charts/your_chart.py
"""
Your Chart Description

PLAYGROUND: Customize...
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

def generate_your_chart(data: dict, output_path: str) -> None:
    """Generate your chart visualization."""

    # Extract data
    series1 = data.get('SERIES_ID', {})
    dates = [datetime.strptime(d + '-01', '%Y-%m-%d')
             for d in series1.get('labels', [])]

    # Create figure
    fig, ax = plt.subplots(figsize=(14, 7), dpi=100)

    # Plot with brand colors
    ax.plot(dates, series1.get('data', []),
            color='#69B3A2',
            linewidth=2.5,
            label='Your Metric')

    # Professional styling (copy from existing charts)
    ax.set_xlabel('Date', fontsize=12, weight='600')
    ax.set_ylabel('Value', fontsize=12, weight='600')
    ax.set_title('Your Chart Title', fontsize=14, weight='600', pad=20)

    # Grid, spines, etc.
    ax.grid(True, alpha=0.3)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # Save
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

    print(f"✓ Generated your chart: {output_path}")
```

3. **Export in `__init__.py`**:
```python
# bcch/python/charts/__init__.py
from .unemployment import generate_unemployment_chart
from .exchange import generate_exchange_chart
from .cpi import generate_cpi_chart
from .your_chart import generate_your_chart  # Add this

__all__ = [
    'generate_unemployment_chart',
    'generate_exchange_chart',
    'generate_cpi_chart',
    'generate_your_chart',  # Add this
]
```

4. **Call in orchestrator**:
```python
# bcch/python/generate_charts.py
from charts import (
    generate_unemployment_chart,
    generate_exchange_chart,
    generate_cpi_chart,
    generate_your_chart,  # Add import
)

def generate_all_charts(data, output_dir):
    # ... existing charts ...

    # Add your chart
    your_chart_path = output_path / "your_chart.png"
    generate_your_chart(data, str(your_chart_path))
```

5. **Test both engines**:
```bash
go run ./bcch viz

# Toggle to 📊 Chart.js - verify
# Toggle to 🐍 Matplotlib - verify
# Compare consistency
```

## Brand Colors (Must Be Consistent)

```python
# Python (matplotlib)
colors = {
    'primary': '#69B3A2',
    'secondary': '#251667',
    'tertiary': '#FED136',
    'accent': '#d6604d',
    'grid': '#f0f0f0',
    'text': '#666666'
}
```

```javascript
// JavaScript (Chart.js)
const brandColors = {
    primary: '#69B3A2',
    secondary: '#251667',
    highlight: '#FED136',
    accent: '#d6604d'
};
```

**Critical**: Both engines MUST use the same colors for the same data series!

## Professional Quality Checklist

Before considering a chart complete:

### Chart.js Version
- [ ] Tooltips show contextual information (value + change)
- [ ] Responsive at 320px, 768px, 1440px viewports
- [ ] Colors match brand palette
- [ ] Axis labels with units
- [ ] Legend clear (or direct labeling used)
- [ ] No console errors
- [ ] Smooth animations
- [ ] Keyboard accessible

### Matplotlib Version
- [ ] DPI = 300 (publication quality)
- [ ] Brand colors match Chart.js
- [ ] Clean spines (top/right removed)
- [ ] Professional typography (weight='600')
- [ ] Proper date formatting
- [ ] Grid behind data (`set_axisbelow(True)`)
- [ ] White background
- [ ] Tight layout (no wasted space)
- [ ] PLAYGROUND markers for learning

### Both Engines
- [ ] Tell the same story
- [ ] Same data series visible
- [ ] Consistent titles and labels
- [ ] Similar visual hierarchy
- [ ] Annotations consistent (if applicable)

## Toggle UI Customization

If you need to modify the toggle behavior:

### JavaScript Toggle Logic
```javascript
// In bcch/public/main.js

function switchRenderingEngine(engine) {
    currentEngine = engine;

    // Update button states
    toggleButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.engine === engine);
    });

    // Show/hide charts with fade effect
    document.querySelectorAll('.chart-wrapper').forEach(wrapper => {
        if (wrapper.dataset.engine === engine) {
            wrapper.classList.remove('hidden');
            setTimeout(() => wrapper.classList.add('visible'), 10);
        } else {
            wrapper.classList.add('hidden');
            wrapper.classList.remove('visible');
        }
    });
}
```

### CSS Styling
```css
/* In bcch/public/styles.css */

.engine-toggle {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;
}

.toggle-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #E9ECEF;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.toggle-btn.active {
    background: #69B3A2;
    color: white;
    border-color: #69B3A2;
}
```

## Common Enhancements

### Add Statistical Annotations (Matplotlib)

```python
# In any chart module

# Add mean line
mean_value = np.mean(data)
ax.axhline(mean_value, color='gray', linestyle='--', alpha=0.5)
ax.text(dates[-1], mean_value, f'Mean: {mean_value:.1f}',
        ha='right', va='bottom', fontsize=9)

# Add std dev band
std_dev = np.std(data)
ax.fill_between(dates, mean_value - std_dev, mean_value + std_dev,
                alpha=0.1, color='gray', label='±1 σ')
```

### Add Interactive Zoom (Chart.js)

```javascript
// Install zoom plugin
// <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom"></script>

options: {
    plugins: {
        zoom: {
            zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x'
            },
            pan: {
                enabled: true,
                mode: 'x'
            }
        }
    }
}
```

### Add Event Markers (Both)

**Matplotlib**:
```python
covid_start = datetime(2020, 3, 1)
ax.axvline(covid_start, color='#FED136', linestyle=':', linewidth=2)
ax.annotate('COVID-19',
            xy=(covid_start, ax.get_ylim()[1]),
            xytext=(10, -10),
            textcoords='offset points',
            fontsize=9,
            color='#251667')
```

**Chart.js**:
```javascript
// Install annotation plugin
plugins: {
    annotation: {
        annotations: {
            covidLine: {
                type: 'line',
                xMin: '2020-03',
                xMax: '2020-03',
                borderColor: '#FED136',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    content: 'COVID-19',
                    enabled: true,
                    position: 'top'
                }
            }
        }
    }
}
```

## Troubleshooting

### Matplotlib charts not showing in toggle?

**Check**:
```bash
# Did Python generation succeed?
go run ./bcch viz
# Look for: "✓ Matplotlib charts generated successfully"

# Do image files exist?
ls bcch/public/img/
# Should see: unemployment_imacec.png, exchange_copper.png, cpi_comparison.png

# Is server serving them?
curl http://localhost:49966/img/unemployment_imacec.png
# Should return image data
```

**Fix**:
```bash
# Install uv if missing
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
cd bcch/python && uv sync

# Regenerate
go run ./bcch viz
```

### Toggle shows blank charts?

**Check browser console** (F12):
- Chart.js errors?
- 404 on image files?
- JavaScript errors in toggle logic?

**Common fix**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## WebFetch Integration

For edge cases not covered in examples:

```javascript
// Use WebFetch to get specific guidance
WebFetch({
  url: "https://www.data-to-viz.com/graph/ridgeline.html",
  prompt: `Extract:
    1. When to use ridgeline plots for economic data
    2. Best practices for visualization
    3. Implementation tips for matplotlib
    Format as concise markdown.`
})
```

**Priority URLs**:
- Line: https://www.data-to-viz.com/graph/line.html
- Bar: https://www.data-to-viz.com/graph/barplot.html
- Dual Y-axis: https://www.data-to-viz.com/caveat/dual_axis.html

## Design Review

For comprehensive validation:
```bash
# Invoke viz-review agent
@agent viz-review "Review the employment dashboard at http://localhost:49966. Test both Chart.js and matplotlib toggle modes."
```

## Final Reminder

🎯 **Goal**: Professional visualizations that:
1. **Inform**: Clear insights from both rendering engines
2. **Educate**: PLAYGROUND markers teach matplotlib
3. **Adapt**: Interactive (Chart.js) + Publication (matplotlib)
4. **Consistent**: Same brand colors, same story
5. **Graceful**: Works without Python (Chart.js fallback)

**Key principle**: When users toggle between engines, they should see the **same data story** told in **two complementary ways** - one for exploration, one for export.

**For Chart.js work**: Refer to `viz-examples.md` and `viz-knowledge-base.md`
**For matplotlib work**: Refer to `viz-python-static.md` and actual chart modules in `bcch/python/charts/`
**For edge cases**: Use WebFetch to check data-to-viz.com
**For design validation**: Use viz-review agent

Happy visualizing! 📊🐍
