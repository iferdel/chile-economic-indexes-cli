# Matplotlib Charts Playground

This directory contains the Python/matplotlib chart generation for the Chilean economic indicators visualization.

## Structure

```
python/
├── pyproject.toml          # uv project configuration
├── .python-version         # Python version specification
├── generate_charts.py      # Main orchestrator (called by Go)
├── charts/
│   ├── __init__.py
│   ├── unemployment.py     # Unemployment + Imacec chart
│   ├── exchange.py         # Exchange rate + Copper chart
│   └── cpi.py             # CPI comparison chart
└── README.md              # This file
```

## Setup

### Prerequisites

- [uv](https://github.com/astral-sh/uv) - Fast Python package installer
- Python 3.11+

### Install uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with pip
pip install uv
```

### Install Dependencies

```bash
cd bcch/python
uv sync
```

This will:
- Create a virtual environment
- Install matplotlib and numpy
- Generate a lockfile (uv.lock)

## Usage

### From Go CLI (Automatic)

When you run `bcch viz`, the Go server automatically:
1. Fetches data from BCCh API
2. Calls this Python script with `uv run`
3. Generates matplotlib charts
4. Serves them alongside Chart.js versions

### Manual Testing

Test chart generation directly:

```bash
cd bcch/python

# Example: Generate charts with sample data
uv run generate_charts.py '{
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
}' ../public/img
```

## Customization (Your Playground!)

Each chart module in `charts/` is heavily commented with `PLAYGROUND` markers showing where you can customize:

### unemployment.py
- Color schemes and line styles
- Dual Y-axis configuration
- Grid and spine styling
- Legend positioning
- Annotations and statistical overlays

### exchange.py
- Fill areas between lines
- Moving averages
- Correlation annotations
- Date range highlighting

### cpi.py
- Comparative visualization techniques
- Statistical annotations (mean, std)
- Zero-line references
- Highlight divergence/convergence periods

## Learning Resources

**Recommended workflow:**
1. Make changes to a chart module (e.g., `charts/unemployment.py`)
2. Run the CLI: `bcch viz`
3. Toggle between Chart.js and Matplotlib in browser to compare
4. Iterate and refine

**Ideas to try:**
- Change color palettes to match your brand
- Add annotations for economic events (e.g., COVID-19, policy changes)
- Experiment with different chart types (area, bar, scatter)
- Add statistical indicators (moving averages, trend lines)
- Customize typography and spacing
- Add watermarks or source citations
- Export as SVG for web or PDF for reports

## Dependencies

Managed via `pyproject.toml`:

- **matplotlib** (>=3.8.0) - Visualization library
- **numpy** (>=1.26.0) - Numerical operations

Add more with:
```bash
uv add <package-name>
```

## Troubleshooting

**Charts not generating?**
- Check Python is 3.11+: `python --version`
- Verify uv is installed: `uv --version`
- Check dependencies: `uv sync`
- View logs when running `bcch viz`

**Want different image format?**
- Edit chart modules and change `.savefig()` extension
- SVG: Better for web scaling
- PNG: Better compatibility
- PDF: Better for print/reports

## Contributing

When adding new charts:
1. Create a new module in `charts/`
2. Add generation function following existing patterns
3. Export it in `charts/__init__.py`
4. Call it from `generate_charts.py`
5. Update HTML to display the new chart

Enjoy your matplotlib journey! 🎨📊
