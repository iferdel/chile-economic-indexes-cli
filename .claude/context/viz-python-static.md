# Python Matplotlib Charts - Hybrid Browser Toggle System

This guide documents the **hybrid visualization system** where users can toggle between Chart.js (interactive) and matplotlib (publication-quality) rendering engines **in the browser**.

## Architecture Overview

### How It Works
```
User clicks viz command
    ↓
Go server starts
    ↓
1. Fetches BCCh data via API
2. Calls Python via `uv run generate_charts.py`
3. Generates matplotlib PNGs → bcch/public/img/
4. Serves hybrid HTML dashboard
    ↓
Browser loads
    ↓
User sees toggle: 📊 Chart.js | 🐍 Matplotlib
    ↓
Click to switch rendering engines instantly
```

### Key Features
✓ **Browser toggle** - Switch engines without page reload
✓ **Graceful fallback** - Works without Python (Chart.js only)
✓ **Learning playground** - "PLAYGROUND" markers for customization
✓ **Brand consistency** - Same colors across both engines
✓ **High DPI** - 300 DPI for publication quality
✓ **uv-based** - Modern Python package management

## File Structure

```
bcch/
├── python/
│   ├── pyproject.toml          # uv project config
│   ├── .python-version         # Python 3.11+
│   ├── README.md               # Setup & playground guide
│   ├── generate_charts.py      # Orchestrator (called by Go)
│   └── charts/
│       ├── __init__.py
│       ├── unemployment.py     # Chart 1: Unemployment + Imacec
│       ├── exchange.py         # Chart 2: Exchange + Copper
│       └── cpi.py              # Chart 3: CPI comparison
│
├── public/
│   ├── img/                    # Generated matplotlib PNGs
│   │   ├── unemployment_imacec.png
│   │   ├── exchange_copper.png
│   │   └── cpi_comparison.png
│   ├── index.html              # Hybrid toggle UI
│   ├── main.js                 # Toggle logic
│   └── styles.css              # Toggle styling
│
└── cmd/
    └── viz.go                  # Calls Python, serves both
```

## Chart Modules Explained

### 1. unemployment.py - Dual Y-Axis Pattern

**Purpose**: Show unemployment trends across different regional economies with economic activity index

**Key matplotlib techniques**:
```python
# Dual Y-axis for different metrics
fig, ax1 = plt.subplots(figsize=(14, 7), dpi=100)

# Primary Y-axis: Unemployment
ax1.plot(dates, national_data, color='#69B3A2', linewidth=2.5)

# Secondary Y-axis: Imacec (economic activity)
ax2 = ax1.twinx()
ax2.plot(dates, imacec_data, color='#d6604d', linewidth=2.5)

# Combine legends from both axes
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')
```

**PLAYGROUND markers**:
- Line styles (solid, dashed, dotted)
- Color schemes
- Grid customization
- Annotations for economic events

### 2. exchange.py - Fill Between Pattern

**Purpose**: Visualize relationship between exchange rate and copper prices

**Key matplotlib techniques**:
```python
# Plot with fill areas
ax.plot(dates, exchange_data, color='#69B3A2')
ax.fill_between(dates, 0, exchange_data, alpha=0.1, color='#69B3A2')

# Dual Y-axis for copper
ax2 = ax.twinx()
ax2.plot(dates, copper_data, color='#d6604d')
```

**PLAYGROUND markers**:
- Fill alpha transparency
- Moving averages
- Correlation annotations
- Event markers

### 3. cpi.py - Comparative Visualization

**Purpose**: Compare inflation trends between Chile and USA

**Key matplotlib techniques**:
```python
# Comparative line plot
ax.plot(dates, chile_cpi, label='Chile', color='#69B3A2', linewidth=2)
ax.plot(dates, usa_cpi, label='USA', color='#251667', linewidth=2)

# Reference line at zero
ax.axhline(0, color='gray', linestyle='--', alpha=0.5)

# Highlight divergence/convergence
ax.fill_between(dates, chile_cpi, usa_cpi,
                where=(chile_cpi > usa_cpi),
                alpha=0.2, color='#69B3A2')
```

**PLAYGROUND markers**:
- Statistical annotations (mean, std dev)
- Zero-line references
- Divergence highlighting
- Period comparisons

## Brand Colors (Consistent Across Engines)

```python
# In Python charts
colors = {
    'primary': '#69B3A2',      # National/main metric
    'secondary': '#251667',     # Secondary regions/metrics
    'tertiary': '#FED136',      # Third metric
    'accent': '#d6604d',        # Contrasting metric (Imacec, copper)
    'grid': '#f0f0f0',         # Subtle grid
    'text': '#666666'          # Axis labels
}
```

```javascript
// In Chart.js (for comparison)
const brandColors = {
    primary: '#69B3A2',
    secondary: '#251667',
    highlight: '#FED136'
};
```

## Professional Styling Checklist

Every matplotlib chart includes:
- [x] **High DPI (300)** - Publication quality
- [x] **Clean spines** - Top/right removed
- [x] **Subtle grid** - Behind data (`set_axisbelow(True)`)
- [x] **Professional typography** - weight='600' for labels
- [x] **Tight layout** - No wasted space
- [x] **White background** - `facecolor='white'`
- [x] **Date formatting** - `mdates.DateFormatter('%Y-%m')`
- [x] **Proper labels** - Units specified, clear titles

## Go ↔ Python Integration

### How Go Calls Python

```go
// In bcch/cmd/viz.go

func (cfg *config) generateMatplotlibCharts(setName string, setData map[string]OutputSetData) error {
    log.Println("Generating matplotlib charts...")

    // 1. Marshal data to JSON
    jsonData, err := json.Marshal(setData)

    // 2. Get paths
    pythonScript := filepath.Join(cwd, "bcch", "python", "generate_charts.py")
    outputDir := filepath.Join(cwd, "bcch", "public", "img")

    // 3. Call Python via uv
    cmd := exec.Command("uv", "run",
        "--directory", filepath.Join(cwd, "bcch", "python"),
        "python", "generate_charts.py",
        string(jsonData), outputDir)

    cmd.Stdout = os.Stdout
    cmd.Stderr = os.Stderr

    // 4. Execute
    if err := cmd.Run(); err != nil {
        return fmt.Errorf("failed to generate matplotlib charts: %w", err)
    }

    log.Println("✓ Matplotlib charts generated successfully")
    return nil
}
```

### Graceful Fallback

If Python/uv is unavailable:
```go
// In StartVizServer
if err := cfg.generateMatplotlibCharts(setName, setData); err != nil {
    log.Printf("⚠ Warning: Could not generate matplotlib charts: %v", err)
    log.Printf("⚠ Continuing with Chart.js visualization only")
    // Server continues, toggle buttons will be hidden or disabled
}
```

## Browser Toggle Implementation

### HTML Structure

```html
<!-- Toggle UI -->
<div class="engine-toggle">
    <span class="toggle-label">Rendering Engine:</span>
    <div class="toggle-buttons">
        <button class="toggle-btn active" data-engine="chartjs">
            <span class="toggle-icon">📊</span>
            Chart.js (Interactive)
        </button>
        <button class="toggle-btn" data-engine="matplotlib">
            <span class="toggle-icon">🐍</span>
            Matplotlib (Python)
        </button>
    </div>
</div>

<!-- Each chart has both versions -->
<div class="chart-container">
    <!-- Chart.js Version (default visible) -->
    <div class="chart-wrapper" data-engine="chartjs">
        <canvas id="unemploymentChart"></canvas>
    </div>

    <!-- Matplotlib Version (hidden initially) -->
    <div class="chart-wrapper hidden" data-engine="matplotlib">
        <img src="img/unemployment_imacec.png" alt="Matplotlib" class="matplotlib-chart">
    </div>
</div>
```

### JavaScript Toggle Logic

```javascript
function switchRenderingEngine(engine) {
    currentEngine = engine;

    // Update button states
    toggleButtons.forEach(btn => {
        if (btn.dataset.engine === engine) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Show/hide chart wrappers with fade effect
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

## Customization Workflow (PLAYGROUND)

### 1. Identify What to Customize

Each chart module has **PLAYGROUND markers**:
```python
# PLAYGROUND: Customize figure size and DPI for different outputs
fig, ax1 = plt.subplots(figsize=(14, 7), dpi=100)

# PLAYGROUND: Brand colors - customize these to match your design system
colors = {
    'primary': '#69B3A2',
    'secondary': '#251667',
    # ... add your colors here
}

# PLAYGROUND: Try different line styles, widths, and markers
ax1.plot(dates, data,
         color=colors['primary'],
         linewidth=2.5,        # Try: 1.5, 2.0, 3.0
         linestyle='-',        # Try: '--', ':', '-.'
         marker='o',           # Try: 's', '^', 'D'
         alpha=0.9)            # Try: 0.5, 0.7, 1.0
```

### 2. Make Changes

```bash
# Edit chart module
vim bcch/python/charts/unemployment.py

# Change something, e.g., add annotations:
ax.annotate('COVID-19 Pandemic',
            xy=(datetime(2020, 3, 1), 10),
            xytext=(datetime(2020, 6, 1), 12),
            arrowprops=dict(arrowstyle='->', color='red'))
```

### 3. Test Your Changes

```bash
# Run the viz command
go run ./bcch viz

# Browser opens with toggle
# Click 🐍 Matplotlib to see your changes
# Click 📊 Chart.js to compare
```

### 4. Iterate

Keep refining until it looks professional!

## Common Customizations

### Add Economic Event Annotations

```python
# Mark a specific date
pandemic_start = datetime(2020, 3, 1)
ax.axvline(pandemic_start,
           color='red',
           linestyle=':',
           linewidth=1.5,
           alpha=0.6)

ax.text(pandemic_start, ax.get_ylim()[1],
        'COVID-19\nPandemic',
        rotation=90,
        verticalalignment='top',
        fontsize=9)
```

### Change Color Palette

```python
# Try seaborn palettes
import seaborn as sns
colors_list = sns.color_palette("husl", 3)  # or "Set2", "Paired"

ax.plot(dates, data1, color=colors_list[0])
ax.plot(dates, data2, color=colors_list[1])
```

### Add Statistical Overlays

```python
import numpy as np

# Moving average
window = 12  # 12-month rolling average
moving_avg = pd.Series(data).rolling(window=window).mean()

ax.plot(dates, moving_avg,
        color='gray',
        linestyle='--',
        label=f'{window}-month MA')

# Confidence interval
std_dev = pd.Series(data).rolling(window=window).std()
ax.fill_between(dates,
                moving_avg - std_dev,
                moving_avg + std_dev,
                alpha=0.2,
                color='gray')
```

### Change Output Format

```python
# In chart modules, change savefig format:

# SVG (scalable, great for web)
plt.savefig(output_path.replace('.png', '.svg'),
            format='svg', bbox_inches='tight')

# PDF (print-ready)
plt.savefig(output_path.replace('.png', '.pdf'),
            format='pdf', dpi=300, bbox_inches='tight')
```

## Setup & Dependencies

### Install uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with pip
pip install uv
```

### Install Project Dependencies

```bash
cd bcch/python
uv sync  # Creates venv, installs matplotlib + numpy, generates lockfile
```

### Verify Setup

```bash
# Check Python version
python --version  # Should be 3.11+

# Check uv
uv --version

# Test chart generation manually
cd bcch/python
uv run generate_charts.py '<json_data>' ../public/img
```

## Troubleshooting

### Charts not generating?

**Check logs:**
```bash
go run ./bcch viz
# Look for:
# "Generating matplotlib charts..."
# "✓ Matplotlib charts generated successfully"
# Or errors like "uv not found in PATH"
```

**Common fixes:**
```bash
# uv not installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Wrong Python version
uv python install 3.11

# Missing dependencies
cd bcch/python && uv sync
```

### Toggle not working?

**If matplotlib toggle is grayed out:**
- Charts didn't generate (check logs)
- Image files missing in `bcch/public/img/`
- Server couldn't serve `/img/` directory

**Fix:**
```bash
# Regenerate charts
go run ./bcch viz

# Check images exist
ls bcch/public/img/
# Should see: unemployment_imacec.png, exchange_copper.png, cpi_comparison.png
```

### Want to test Python script directly?

```bash
cd bcch/python

# Create test data
cat > test_data.json << 'EOF'
{
  "EMPLOYMENT": {
    "seriesData": {
      "F049.DES.TAS.INE.10.M": {
        "Series": {
          "Obs": [
            {"indexDateString": "01-01-2020", "value": "7.5"},
            {"indexDateString": "01-02-2020", "value": "7.3"}
          ]
        }
      }
    }
  }
}
EOF

# Run generator
uv run generate_charts.py "$(cat test_data.json)" ../public/img
```

## Comparison: Chart.js vs Matplotlib

| Aspect | Chart.js 📊 | Matplotlib 🐍 |
|--------|------------|--------------|
| **Interactivity** | ✓ Tooltips, zoom, pan | Static image |
| **Quality** | Good (browser rendered) | Excellent (300 DPI) |
| **Load Time** | Instant (client-side) | Pre-generated (fast) |
| **Customization** | Via JS/CSS | Via Python code |
| **Use Case** | Exploration, dashboards | Reports, papers, presentations |
| **Dependencies** | None (browser only) | Python, uv, matplotlib |
| **File Size** | Lightweight (canvas) | Larger (PNG ~500KB each) |
| **Accessibility** | Built-in browser support | Alt text, image description |

## Best Practices

### When to Use Matplotlib Toggle

**Use matplotlib when**:
✓ Creating screenshots for presentations
✓ Exporting charts for reports/papers
✓ Need publication-quality (300 DPI)
✓ Want to learn matplotlib techniques
✓ Comparing rendering approaches

**Use Chart.js when**:
✓ Exploring data interactively
✓ Need real-time tooltips
✓ Zooming/panning required
✓ Sharing live dashboard URL
✓ Python not available

### Learning Path

1. **Start with Chart.js** - Understand the data
2. **Toggle to matplotlib** - See static version
3. **Customize Python charts** - Add your touches
4. **Compare results** - Toggle back and forth
5. **Export favorites** - Save matplotlib PNGs for reports

## Advanced: Batch Generation

Generate charts for different time periods or sets:

```python
# In generate_charts.py, add custom date range filtering
def generate_all_charts(data: Dict[str, Any], output_dir: str, date_range: tuple = None) -> None:
    if date_range:
        start_date, end_date = date_range
        # Filter data by date range
        filtered_data = filter_by_date(data, start_date, end_date)
    else:
        filtered_data = data

    # Generate with filtered data
    generate_unemployment_chart(filtered_data, str(output_path / "unemployment.png"))
```

## Contributing New Charts

To add a new chart type:

1. **Create module**: `bcch/python/charts/my_chart.py`
2. **Follow pattern**:
   ```python
   def generate_my_chart(data: dict, output_path: str) -> None:
       """Docstring explaining what this chart shows."""

       # Extract series
       series1 = data.get('SERIES_ID_1', {})

       # Create figure
       fig, ax = plt.subplots(figsize=(14, 7), dpi=100)

       # Plot with brand colors
       ax.plot(dates, values, color='#69B3A2')

       # Styling
       ax.set_xlabel('Date', fontsize=12, weight='600')
       # ... more styling

       # Save
       plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
       plt.close()
   ```

3. **Export**: Add to `charts/__init__.py`
4. **Call**: Add to `generate_charts.py`
5. **Display**: Add to `index.html` with toggle
6. **Test**: Run `go run ./bcch viz`

## Summary

This **hybrid browser toggle system** gives you the best of both worlds:
- 📊 **Chart.js** for interactive exploration
- 🐍 **Matplotlib** for publication-quality static charts

Users can instantly switch between rendering engines to:
- **Learn** matplotlib visualization techniques
- **Compare** different rendering approaches
- **Export** professional charts for reports
- **Explore** data interactively

The system gracefully falls back to Chart.js if Python is unavailable, making it robust for all users.
