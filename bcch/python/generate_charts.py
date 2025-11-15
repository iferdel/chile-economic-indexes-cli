#!/usr/bin/env python3
"""
Matplotlib Chart Generation Orchestrator

This script generates all matplotlib charts for the Chilean economic indicators dashboard.
It's called by the Go server during visualization startup.

Usage:
    python generate_charts.py <json_data> <output_dir>

Arguments:
    json_data: JSON string containing series data from BCCh API
    output_dir: Directory path where charts will be saved

Example:
    python generate_charts.py '{"EMPLOYMENT": {...}}' ./public/img
"""

import sys
import json
import os
from pathlib import Path
from typing import Dict, Any

from charts import (
    generate_unemployment_chart,
    generate_exchange_chart,
    generate_cpi_chart,
)


def parse_bcch_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse BCCh API data into format expected by chart generation functions.

    Args:
        raw_data: Raw data from Go server (BCCh API format)

    Returns:
        Dictionary with series IDs as keys and {labels, data} as values
    """
    parsed = {}

    # Extract the EMPLOYMENT set data
    employment_set = raw_data.get('EMPLOYMENT', {})
    series_data = employment_set.get('seriesData', {})

    for series_id, series_info in series_data.items():
        series_obj = series_info.get('Series', {})
        observations = series_obj.get('Obs', [])

        labels = []
        data = []

        for obs in observations:
            # Parse date from dd-MM-yyyy to YYYY-MM
            date_str = obs.get('indexDateString', '')
            if date_str:
                try:
                    day, month, year = date_str.split('-')
                    formatted_date = f"{year}-{month.zfill(2)}"
                    labels.append(formatted_date)
                except (ValueError, AttributeError):
                    continue

            # Parse value
            value_str = obs.get('value', 'NaN')
            if value_str != 'NaN' and value_str is not None:
                try:
                    data.append(float(value_str))
                except (ValueError, TypeError):
                    continue

        parsed[series_id] = {
            'labels': labels,
            'data': data
        }

    return parsed


def ensure_output_directory(output_dir: str) -> Path:
    """
    Create output directory if it doesn't exist.

    Args:
        output_dir: Path to output directory

    Returns:
        Path object for the output directory
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    return output_path


def generate_all_charts(data: Dict[str, Any], output_dir: str) -> None:
    """
    Generate all matplotlib charts and save to output directory.

    Args:
        data: Parsed series data
        output_dir: Directory where charts will be saved
    """
    output_path = ensure_output_directory(output_dir)

    print("Starting matplotlib chart generation...")
    print(f"Output directory: {output_path.absolute()}")
    print(f"Found {len(data)} data series")

    try:
        # Generate unemployment + Imacec chart
        unemployment_path = output_path / "unemployment_imacec.png"
        generate_unemployment_chart(data, str(unemployment_path))

        # Generate exchange rate + copper chart
        exchange_path = output_path / "exchange_copper.png"
        generate_exchange_chart(data, str(exchange_path))

        # Generate CPI comparison chart
        cpi_path = output_path / "cpi_comparison.png"
        generate_cpi_chart(data, str(cpi_path))

        print("\n✓ All charts generated successfully!")

    except Exception as e:
        print(f"\n✗ Error generating charts: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    """Main entry point for chart generation script."""
    if len(sys.argv) < 3:
        print("Usage: python generate_charts.py <json_data> <output_dir>", file=sys.stderr)
        sys.exit(1)

    # Parse command-line arguments
    json_data_str = sys.argv[1]
    output_dir = sys.argv[2]

    try:
        # Parse JSON data
        raw_data = json.loads(json_data_str)

        # Parse BCCh data format
        parsed_data = parse_bcch_data(raw_data)

        # Generate all charts
        generate_all_charts(parsed_data, output_dir)

    except json.JSONDecodeError as e:
        print(f"✗ Invalid JSON data: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
