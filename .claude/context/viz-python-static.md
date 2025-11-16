# Python Static Chart Generation Guide

This guide provides patterns for generating static chart images (PNG/SVG) using matplotlib, intended for the `viz` command to output saved files instead of/in addition to web dashboards.

## Architecture: Static Chart Generation

### Workflow
```
CLI Command → Fetch BCCh Data → Generate Matplotlib Charts → Save PNG/SVG →
  Option 1: Save to directory
  Option 2: Serve via simple gallery HTML
  Option 3: Export as PDF report
```

### Directory Structure
```
output/
  └── employment/
      ├── index.html          # Simple gallery
      ├── national-trend.png
      ├── regional-comparison.png
      ├── regional-grid.png
      └── metadata.json
```

## Python Chart Generation Patterns

### Pattern 1: Time Series with Professional Styling

```python
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import json

# Brand colors from design-principles.md
BRAND_COLORS = {
    'primary': '#69B3A2',
    'secondary': '#251667',
    'highlight': '#FED136',
    'neutral': '#E9ECEF',
    'text': '#212529'
}

def create_employment_trend(data, output_path='employment_trend.png'):
    """
    Generate professional time series chart for employment data.

    Args:
        data: Dict with 'dates' (list) and 'values' (list)
        output_path: Where to save the PNG
    """
    # Set up figure with high DPI for quality
    fig, ax = plt.subplots(figsize=(12, 6), dpi=150)

    # Convert dates
    dates = [datetime.fromisoformat(d) for d in data['dates']]
    values = data['values']

    # Plot with brand colors
    ax.plot(dates, values,
            color=BRAND_COLORS['primary'],
            linewidth=2.5,
            marker='o',
            markersize=4,
            markerfacecolor=BRAND_COLORS['primary'],
            markeredgecolor=BRAND_COLORS['secondary'],
            markeredgewidth=1,
            label='Employment Rate')

    # Styling following data-to-viz best practices
    ax.set_xlabel('Month', fontsize=12, fontweight='bold')
    ax.set_ylabel('Employment Rate (%)', fontsize=12, fontweight='bold')
    ax.set_title('Chilean Employment Rate, 2020-2024',
                 fontsize=14, fontweight='bold', pad=20)

    # Format X-axis dates
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    ax.xaxis.set_major_locator(mdates.MonthLocator(interval=3))
    plt.xticks(rotation=45, ha='right')

    # Professional grid
    ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.5)
    ax.set_axisbelow(True)  # Grid behind data

    # Remove top and right spines (cleaner look)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(BRAND_COLORS['text'])
    ax.spines['bottom'].set_color(BRAND_COLORS['text'])

    # Add reference line (e.g., national average)
    if 'average' in data:
        ax.axhline(data['average'],
                   color=BRAND_COLORS['highlight'],
                   linestyle='--',
                   linewidth=2,
                   alpha=0.7,
                   label=f"Average: {data['average']:.1f}%")

    # Add annotation for significant event
    if 'events' in data:
        for event in data['events']:
            event_date = datetime.fromisoformat(event['date'])
            ax.axvline(event_date,
                      color=BRAND_COLORS['highlight'],
                      linestyle=':',
                      linewidth=1.5,
                      alpha=0.6)
            ax.text(event_date, ax.get_ylim()[1],
                   event['label'],
                   rotation=90,
                   verticalalignment='top',
                   fontsize=9,
                   color=BRAND_COLORS['secondary'])

    # Legend
    ax.legend(loc='best', frameon=True, shadow=True)

    # Tight layout to prevent label cutoff
    plt.tight_layout()

    # Save with high quality
    plt.savefig(output_path,
                dpi=150,
                bbox_inches='tight',
                facecolor='white',
                edgecolor='none')
    plt.close()

    print(f"✓ Saved chart to {output_path}")
    return output_path
```

### Pattern 2: Regional Comparison Bar Chart

```python
def create_regional_comparison(regions_data, output_path='regional_comparison.png'):
    """
    Generate horizontal bar chart comparing regions.

    Args:
        regions_data: Dict with 'regions' (list) and 'rates' (list)
    """
    fig, ax = plt.subplots(figsize=(10, 8), dpi=150)

    # Sort by value
    sorted_data = sorted(zip(regions_data['regions'], regions_data['rates']),
                        key=lambda x: x[1],
                        reverse=True)
    regions, rates = zip(*sorted_data)

    # Determine colors (highlight national average)
    colors = [BRAND_COLORS['highlight'] if r == 'Nacional'
              else BRAND_COLORS['primary']
              for r in regions]

    # Create horizontal bars
    bars = ax.barh(regions, rates,
                   color=colors,
                   edgecolor=BRAND_COLORS['secondary'],
                   linewidth=1.5,
                   height=0.7)

    # Add value labels on bars
    for i, (bar, rate) in enumerate(zip(bars, rates)):
        width = bar.get_width()
        ax.text(width + 0.3, i,
                f'{rate:.1f}%',
                va='center',
                fontsize=10,
                fontweight='bold',
                color=BRAND_COLORS['text'])

    # Styling
    ax.set_xlabel('Employment Rate (%)', fontsize=12, fontweight='bold')
    ax.set_title('Employment Rate by Region, Q4 2024',
                 fontsize=14, fontweight='bold', pad=20)

    # Clean spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # Set X-axis limit with padding for labels
    ax.set_xlim(0, max(rates) + 5)

    # Grid
    ax.grid(True, axis='x', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()

    print(f"✓ Saved chart to {output_path}")
    return output_path
```

### Pattern 3: Small Multiples Grid

```python
def create_regional_grid(all_regions_data, output_path='regional_grid.png'):
    """
    Generate small multiples showing each region's trend.

    Args:
        all_regions_data: Dict mapping region names to their time series data
    """
    regions = list(all_regions_data.keys())
    n_regions = len(regions)

    # Calculate grid dimensions
    n_cols = 3
    n_rows = (n_regions + n_cols - 1) // n_cols

    fig, axes = plt.subplots(n_rows, n_cols,
                             figsize=(15, 4 * n_rows),
                             dpi=150,
                             sharey=True)
    axes = axes.flatten() if n_regions > 1 else [axes]

    # Global Y-axis limits
    all_values = [val for region_data in all_regions_data.values()
                  for val in region_data['values']]
    y_min, y_max = min(all_values) - 1, max(all_values) + 1

    for idx, region in enumerate(regions):
        ax = axes[idx]
        data = all_regions_data[region]
        dates = [datetime.fromisoformat(d) for d in data['dates']]

        # Plot
        ax.plot(dates, data['values'],
                color=BRAND_COLORS['primary'],
                linewidth=2)

        # Reference line (national average)
        if 'national_avg' in data:
            ax.axhline(data['national_avg'],
                      color=BRAND_COLORS['highlight'],
                      linestyle='--',
                      linewidth=1,
                      alpha=0.7)

        # Title
        ax.set_title(region, fontsize=11, fontweight='bold')

        # Styling
        ax.set_ylim(y_min, y_max)
        ax.grid(True, alpha=0.2)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

        # Labels only on edges
        if idx >= n_regions - n_cols:  # Bottom row
            ax.set_xlabel('Year', fontsize=9)
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
        else:
            ax.set_xticklabels([])

        if idx % n_cols == 0:  # Left column
            ax.set_ylabel('Rate (%)', fontsize=9)

    # Hide unused subplots
    for idx in range(n_regions, len(axes)):
        axes[idx].set_visible(False)

    # Overall title
    fig.suptitle('Regional Employment Trends, 2020-2024',
                 fontsize=16, fontweight='bold', y=0.995)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()

    print(f"✓ Saved chart to {output_path}")
    return output_path
```

## CLI Integration Pattern

### Go calls Python script

```python
# scripts/generate_charts.py
#!/usr/bin/env python3
"""
Generate static charts for BCCh economic data.
Called by Go CLI with JSON data via stdin.
"""

import sys
import json
import argparse
from pathlib import Path
from chart_generators import (
    create_employment_trend,
    create_regional_comparison,
    create_regional_grid
)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--set', required=True, help='Dataset name (e.g., EMPLOYMENT)')
    parser.add_argument('--output-dir', required=True, help='Output directory')
    parser.add_argument('--format', default='png', choices=['png', 'svg', 'pdf'])
    args = parser.parse_args()

    # Read data from stdin (passed by Go)
    data = json.load(sys.stdin)

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate charts based on dataset type
    if args.set == 'EMPLOYMENT':
        # Chart 1: National trend
        create_employment_trend(
            data['national'],
            output_dir / f'national_trend.{args.format}'
        )

        # Chart 2: Regional comparison
        create_regional_comparison(
            data['regional'],
            output_dir / f'regional_comparison.{args.format}'
        )

        # Chart 3: Small multiples
        create_regional_grid(
            data['regional_time_series'],
            output_dir / f'regional_grid.{args.format}'
        )

    # Generate simple HTML gallery
    generate_gallery_html(output_dir, args.set)

    print(f"\n✓ All charts saved to {output_dir}")
    print(f"  Open {output_dir}/index.html to view")

def generate_gallery_html(output_dir, dataset_name):
    """Create simple HTML gallery for generated charts."""
    charts = list(output_dir.glob('*.png')) + list(output_dir.glob('*.svg'))

    html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{dataset_name} - Chilean Economic Indicators</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }}
        h1 {{
            color: #251667;
            border-bottom: 3px solid #69B3A2;
            padding-bottom: 10px;
        }}
        .chart {{
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        img {{
            max-width: 100%;
            height: auto;
            display: block;
        }}
    </style>
</head>
<body>
    <h1>{dataset_name} Charts</h1>
    <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
"""

    for chart in sorted(charts):
        chart_name = chart.stem.replace('_', ' ').title()
        html += f"""
    <div class="chart">
        <h2>{chart_name}</h2>
        <img src="{chart.name}" alt="{chart_name}">
    </div>
"""

    html += """
</body>
</html>
"""

    (output_dir / 'index.html').write_text(html)

if __name__ == '__main__':
    main()
```

### Modified Go viz command

```go
// In bcch/cmd/viz.go

import (
    "encoding/json"
    "os/exec"
    "bytes"
)

var vizCmd = &cobra.Command{
    Use:   "viz",
    Short: "Generate visualizations for economic data",
    Run: func(cmd *cobra.Command, args []string) {
        setName := "EMPLOYMENT"
        outputDir := "./output/employment"
        format := "png"  // or "svg", "pdf"

        // Fetch data from BCCh API
        data := cfg.fetchSeries(setName, set, 3)

        // Convert to JSON
        jsonData, _ := json.Marshal(data)

        // Call Python script
        pythonCmd := exec.Command(
            "python3",
            "scripts/generate_charts.py",
            "--set", setName,
            "--output-dir", outputDir,
            "--format", format,
        )

        pythonCmd.Stdin = bytes.NewReader(jsonData)
        pythonCmd.Stdout = os.Stdout
        pythonCmd.Stderr = os.Stderr

        if err := pythonCmd.Run(); err != nil {
            log.Fatalf("Failed to generate charts: %v", err)
        }

        // Option: Open browser to view gallery
        browser.OpenURL(fmt.Sprintf("file://%s/index.html", outputDir))
    },
}
```

## Quality Standards for Static Charts

### File Specifications
- **Format**: PNG (raster) or SVG (vector)
- **DPI**: 150 minimum (300 for print)
- **Size**:
  - Single chart: 1200-1500px wide
  - Grid: 1500-1800px wide
  - Mobile-friendly: Responsive HTML gallery

### Accessibility
```python
# Add alt text metadata
chart_metadata = {
    'filename': 'employment_trend.png',
    'alt_text': 'Line chart showing Chilean employment rate from 92% in 2020 to 95% in 2024',
    'description': 'Employment rate steadily increased except for pandemic dip in 2020',
    'data_summary': {
        'min': 91.2,
        'max': 95.8,
        'trend': 'increasing'
    }
}
```

### Professional Styling Checklist
- [ ] Brand colors applied (#69B3A2, #251667, #FED136)
- [ ] High DPI (150+) for sharp rendering
- [ ] Clean spines (top/right removed)
- [ ] Subtle grid behind data
- [ ] Professional typography (bold titles, clear labels)
- [ ] Proper date formatting
- [ ] Value labels where helpful
- [ ] White background (good for reports/presentations)
- [ ] Tight bounding box (no wasted space)
- [ ] Annotations for important events
- [ ] Legend only when necessary

## Testing Generated Charts

```python
def test_chart_quality(chart_path):
    """Validate generated chart meets standards."""
    from PIL import Image

    img = Image.open(chart_path)

    # Check DPI
    assert img.info.get('dpi', (0, 0))[0] >= 150, "DPI too low"

    # Check dimensions
    width, height = img.size
    assert width >= 1200, f"Width too small: {width}px"

    # Check file size (shouldn't be too large)
    file_size_mb = Path(chart_path).stat().st_size / (1024 * 1024)
    assert file_size_mb < 2, f"File too large: {file_size_mb:.1f}MB"

    print(f"✓ {chart_path.name} passes quality checks")
```

## Output Structure

```
output/
└── employment/
    ├── index.html                 # Gallery view
    ├── national_trend.png         # Time series
    ├── regional_comparison.png    # Bar chart
    ├── regional_grid.png          # Small multiples
    ├── metadata.json              # Chart info for accessibility
    └── data.json                  # Raw data for reproducibility
```

## Dependencies

```
# requirements.txt
matplotlib>=3.8.0
pandas>=2.1.0
Pillow>=10.0.0  # For image validation
```

## When to Use Static vs Web Viz

**Static PNG/SVG (Python)**:
✓ Reports and presentations
✓ Email attachments
✓ Print materials
✓ Archival/documentation
✓ Offline viewing
✓ Consistent rendering across platforms

**Web Interactive (Chart.js/D3)**:
✓ Real-time dashboards
✓ User exploration (zoom, filter, drill-down)
✓ Mobile responsive interfaces
✓ Live data updates
✓ Sharing via URL

**Best of Both**:
Generate static charts for reports, serve web dashboard for exploration.
