"""
Consumer Price Index Comparison: Chile vs USA

This module generates the CPI comparison chart showing:
- Chile CPI (monthly variation)
- USA CPI (12-month variation)

PLAYGROUND: Customize this chart to practice matplotlib techniques!
Try different:
- Comparative visualization techniques
- Highlight divergence/convergence periods
- Add statistical annotations (mean, std, etc.)
- Zero-line reference for inflation
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import numpy as np


def generate_cpi_chart(data: dict, output_path: str) -> None:
    """
    Generate CPI comparison chart between Chile and USA.

    Args:
        data: Dictionary containing series data from BCCh API
        output_path: Path to save the generated chart (PNG/SVG)
    """

    # Extract data series
    chile_cpi = data.get('F074.IPC.VAR.Z.Z.C.M', {})
    usa_cpi = data.get('F019.IPC.V12.10.M', {})

    # Use Chile CPI dates as primary timeline
    dates = [datetime.strptime(label + '-01', '%Y-%m-%d') for label in chile_cpi.get('labels', [])]

    # PLAYGROUND: Customize figure size
    fig, ax = plt.subplots(figsize=(14, 7), dpi=100)

    # PLAYGROUND: Brand colors
    colors = {
        'chile': '#69B3A2',        # Chile CPI
        'usa': '#d6604d',          # USA CPI
        'zero': '#999999',         # Zero reference line
        'grid': '#f0f0f0',
        'text': '#666666'
    }

    # Plot Chile CPI
    # PLAYGROUND: Try area plots, or fill_between for emphasis
    ax.plot(dates, chile_cpi.get('data', []),
            color=colors['chile'],
            linewidth=2,
            label='CPI Chile (Monthly Variation %)',
            alpha=0.9,
            zorder=3)

    # Plot USA CPI
    # PLAYGROUND: Try different line styles to distinguish series
    usa_dates = [datetime.strptime(label + '-01', '%Y-%m-%d') for label in usa_cpi.get('labels', [])]
    ax.plot(usa_dates, usa_cpi.get('data', []),
            color=colors['usa'],
            linewidth=2,
            label='CPI USA (12-month Variation %)',
            alpha=0.9,
            zorder=3)

    # PLAYGROUND: Add zero reference line
    ax.axhline(y=0, color=colors['zero'], linestyle='--', linewidth=1, alpha=0.5, zorder=1)

    # PLAYGROUND: Axis labels and styling
    ax.set_xlabel('Date (Year-Month)', fontsize=12, color=colors['text'], weight='600')
    ax.set_ylabel('Consumer Price Index (%)', fontsize=12, color=colors['text'], weight='600')
    ax.tick_params(axis='both', labelcolor=colors['text'], labelsize=10)

    # PLAYGROUND: Grid customization
    ax.grid(True, alpha=0.3, linestyle='-', linewidth=0.5, color=colors['grid'], zorder=0)
    ax.set_axisbelow(True)

    # PLAYGROUND: Date formatting
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    ax.xaxis.set_major_locator(mdates.YearLocator())
    ax.xaxis.set_minor_locator(mdates.MonthLocator((1, 7)))
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')

    # PLAYGROUND: Legend customization
    ax.legend(loc='upper left',
             frameon=True,
             fancybox=False,
             shadow=False,
             fontsize=10)

    # PLAYGROUND: Title
    plt.title('Consumer Price Index Comparison: Chile vs USA',
              fontsize=14, weight='600', pad=20, color='#212529')

    # PLAYGROUND: Spine customization
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # PLAYGROUND: Statistical annotations
    # Example: Add mean lines or annotations for key events
    # chile_mean = np.mean(chile_cpi.get('data', []))
    # ax.axhline(y=chile_mean, color=colors['chile'], linestyle=':', linewidth=1, alpha=0.5)

    plt.tight_layout()

    # Save the figure
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

    print(f"✓ Generated CPI comparison chart: {output_path}")
