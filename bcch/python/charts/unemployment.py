"""
Unemployment Rate & Imacec Visualization

This module generates the unemployment comparison chart showing:
- National unemployment rate
- Antofagasta region (mining economy)
- Ñuble region (rural economy)
- Imacec rate (year-over-year economic activity)

PLAYGROUND: Customize this chart to practice matplotlib techniques!
Try different:
- Color schemes
- Line styles
- Annotations
- Gridlines
- Legend positions
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import numpy as np


def generate_unemployment_chart(data: dict, output_path: str) -> None:
    """
    Generate unemployment vs Imacec dual Y-axis chart.

    Args:
        data: Dictionary containing series data from BCCh API
        output_path: Path to save the generated chart (PNG/SVG)

    Example data structure:
        {
            'F049.DES.TAS.INE.10.M': {'labels': [...], 'data': [...]},
            'F049.DES.TAS.INE9.12.M': {'labels': [...], 'data': [...]},
            ...
        }
    """

    # Extract data series
    national_unemp = data.get('F049.DES.TAS.INE.10.M', {})
    antofagasta_unemp = data.get('F049.DES.TAS.INE9.12.M', {})
    nuble_unemp = data.get('F049.DES.TAS.INE9.26.M', {})
    imacec = data.get('F032.IMC.IND.Z.Z.EP18.Z.Z.1.M', {})

    # Convert labels to datetime objects
    dates = [datetime.strptime(label + '-01', '%Y-%m-%d') for label in national_unemp.get('labels', [])]

    # PLAYGROUND: Customize figure size and DPI for different outputs
    fig, ax1 = plt.subplots(figsize=(14, 7), dpi=100)

    # PLAYGROUND: Brand colors - customize these to match your design system
    colors = {
        'primary': '#69B3A2',      # National unemployment
        'secondary': '#251667',     # Antofagasta
        'tertiary': '#FED136',      # Ñuble
        'accent': '#d6604d',        # Imacec
        'grid': '#f0f0f0',
        'text': '#666666'
    }

    # Plot unemployment data on primary Y-axis
    # PLAYGROUND: Try different line styles, widths, and markers
    ax1.plot(dates, national_unemp.get('data', []),
             color=colors['primary'],
             linewidth=2.5,
             label='National Unemployment Rate (%)',
             alpha=0.9)

    ax1.plot(dates, antofagasta_unemp.get('data', []),
             color=colors['secondary'],
             linewidth=1.5,
             linestyle='--',
             label='Antofagasta Region (%)',
             alpha=0.8)

    ax1.plot(dates, nuble_unemp.get('data', []),
             color=colors['tertiary'],
             linewidth=1.5,
             linestyle=':',
             label='Ñuble Region (%)',
             alpha=0.8)

    # PLAYGROUND: Customize Y-axis appearance
    ax1.set_xlabel('Date (Year-Month)', fontsize=12, color=colors['text'], weight='600')
    ax1.set_ylabel('Unemployment Rate (%)', fontsize=12, color=colors['text'], weight='600')
    ax1.tick_params(axis='y', labelcolor=colors['text'])
    ax1.tick_params(axis='x', labelcolor=colors['text'], labelsize=10)

    # PLAYGROUND: Grid customization
    ax1.grid(True, alpha=0.3, linestyle='-', linewidth=0.5, color=colors['grid'])
    ax1.set_axisbelow(True)  # Grid behind data

    # Create second Y-axis for Imacec
    ax2 = ax1.twinx()

    # Calculate Imacec YoY rate if we have the data
    imacec_data = imacec.get('data', [])
    imacec_labels = imacec.get('labels', [])
    if len(imacec_data) > 12:
        imacec_rate = []
        imacec_dates = []
        for i in range(12, len(imacec_data)):
            yoy_change = imacec_data[i] - imacec_data[i - 12]
            imacec_rate.append(yoy_change)
            imacec_dates.append(datetime.strptime(imacec_labels[i] + '-01', '%Y-%m-%d'))

        # PLAYGROUND: Customize Imacec line appearance
        ax2.plot(imacec_dates, imacec_rate,
                 color=colors['accent'],
                 linewidth=2.5,
                 label='Imacec Rate (YoY Change)',
                 alpha=0.9)

    ax2.set_ylabel('Imacec Rate (YoY %)', fontsize=12, color=colors['accent'], weight='600')
    ax2.tick_params(axis='y', labelcolor=colors['text'])

    # PLAYGROUND: Date formatting on X-axis
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    ax1.xaxis.set_major_locator(mdates.YearLocator())
    ax1.xaxis.set_minor_locator(mdates.MonthLocator((1, 7)))
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')

    # PLAYGROUND: Legend customization
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2,
              loc='upper left',
              frameon=True,
              fancybox=False,
              shadow=False,
              fontsize=10)

    # PLAYGROUND: Title customization
    plt.title('Unemployment Rate & Monthly Index of Economic Activity (Imacec)',
              fontsize=14, weight='600', pad=20, color='#212529')

    # Remove top and right spines for cleaner look
    # PLAYGROUND: Try different spine configurations
    ax1.spines['top'].set_visible(False)
    ax2.spines['top'].set_visible(False)

    # Tight layout to prevent label cutoff
    plt.tight_layout()

    # Save the figure
    # PLAYGROUND: Try different formats (SVG for scalability, PNG for compatibility)
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

    print(f"✓ Generated unemployment chart: {output_path}")
