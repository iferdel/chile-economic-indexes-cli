"""
Exchange Rate & Copper Price Visualization

This module generates the currency and commodity chart showing:
- USD to CLP exchange rate
- Copper price (USD per pound)

PLAYGROUND: Customize this chart to practice matplotlib techniques!
Try different:
- Dual Y-axis configurations
- Fill areas between lines
- Moving averages
- Correlation annotations
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import numpy as np


def generate_exchange_chart(data: dict, output_path: str) -> None:
    """
    Generate exchange rate vs copper price dual Y-axis chart.

    Args:
        data: Dictionary containing series data from BCCh API
        output_path: Path to save the generated chart (PNG/SVG)
    """

    # Extract data series
    exchange_rate = data.get('F073.TCO.PRE.Z.D', {})
    copper_price = data.get('F019.PPB.PRE.100.D', {})

    # Use exchange rate dates as primary timeline
    dates = [datetime.strptime(label + '-01', '%Y-%m-%d') for label in exchange_rate.get('labels', [])]

    # PLAYGROUND: Customize figure size
    fig, ax1 = plt.subplots(figsize=(14, 7), dpi=100)

    # PLAYGROUND: Brand colors
    colors = {
        'exchange': '#69B3A2',     # Exchange rate color
        'copper': '#251667',       # Copper price color
        'grid': '#f0f0f0',
        'text': '#666666'
    }

    # Plot exchange rate on primary Y-axis
    # PLAYGROUND: Try adding fill_between for visual interest
    ax1.plot(dates, exchange_rate.get('data', []),
             color=colors['exchange'],
             linewidth=2,
             label='USD to CLP Exchange Rate',
             alpha=0.9)

    ax1.set_xlabel('Date (Year-Month)', fontsize=12, color=colors['text'], weight='600')
    ax1.set_ylabel('USD to CLP Exchange Rate', fontsize=12, color=colors['exchange'], weight='600')
    ax1.tick_params(axis='y', labelcolor=colors['text'])
    ax1.tick_params(axis='x', labelcolor=colors['text'], labelsize=10)

    # PLAYGROUND: Grid styling
    ax1.grid(True, alpha=0.3, linestyle='-', linewidth=0.5, color=colors['grid'])
    ax1.set_axisbelow(True)

    # Create second Y-axis for copper price
    ax2 = ax1.twinx()

    # Plot copper price
    # PLAYGROUND: Try different line styles or add markers at key points
    copper_dates = [datetime.strptime(label + '-01', '%Y-%m-%d') for label in copper_price.get('labels', [])]
    ax2.plot(copper_dates, copper_price.get('data', []),
             color=colors['copper'],
             linewidth=2,
             label='Copper Price (USD/lb)',
             alpha=0.9)

    ax2.set_ylabel('Copper Price (USD/lb)', fontsize=12, color=colors['copper'], weight='600')
    ax2.tick_params(axis='y', labelcolor=colors['text'])

    # PLAYGROUND: Date formatting
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    ax1.xaxis.set_major_locator(mdates.YearLocator())
    ax1.xaxis.set_minor_locator(mdates.MonthLocator((1, 7)))
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')

    # PLAYGROUND: Legend placement and styling
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2,
              loc='upper left',
              frameon=True,
              fancybox=False,
              shadow=False,
              fontsize=10)

    # PLAYGROUND: Title
    plt.title('Chilean Currency Exchange Rate & Copper Value',
              fontsize=14, weight='600', pad=20, color='#212529')

    # PLAYGROUND: Spine customization
    ax1.spines['top'].set_visible(False)
    ax2.spines['top'].set_visible(False)

    plt.tight_layout()

    # PLAYGROUND: Try SVG format for web
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

    print(f"✓ Generated exchange rate chart: {output_path}")
