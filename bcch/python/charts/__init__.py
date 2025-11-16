"""
Matplotlib chart generation modules for Chilean economic indicators.

This package contains modular chart generation functions that can be
customized and extended for learning matplotlib visualization techniques.
"""

from .unemployment import generate_unemployment_chart
from .exchange import generate_exchange_chart
from .cpi import generate_cpi_chart

__all__ = [
    "generate_unemployment_chart",
    "generate_exchange_chart",
    "generate_cpi_chart",
]
