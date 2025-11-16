# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
```bash
# Run the project
go run ./bcch
```
### Testing and Quality Assurance
```bash
# Run all quality checks (equivalent to CI)
make
```
## Architecture Overview

This is a CLI tool for interacting with the Banco Central de Chile (BCCh) API, built with Go 1.23.4 and Cobra CLI framework.

### Project Structure
- `bcch/` - Main CLI application entry point and command definitions
  - `cmd/` - CLI command implementations
  - `python/` - Matplotlib chart generation (Python/uv project)
  - `public/` - Static files for the visualization web server
- `internal/bcch-api/` - BCCh API client with authentication and HTTP handling
- `internal/bcch-cache/` - Time-based caching system for API responses (24h default)
- `internal/fileio/` - JSON file operations for data export
- `internal/spinner/` - Loading spinner for user experience

### Key Components

**CLI Commands** (`bcch/cmd/`):
- `root.go` - Main command configuration with predefined series sets
- `search.go` - Search available data series with keyword/frequency filtering
- `get.go` - Retrieve specific series data by ID
- `setcredentials.go` - Store BCCh API credentials locally
- `viz.go` - Launches a hybrid web server that serves static files (HTML, CSS, JS) from the `public/` folder and provides REST API endpoints (e.g., `/api/sets/{set}`) for dynamic data fetching. Includes browser integration to automatically open the visualization dashboard
- `completion.go` - Shell completion support

**API Client** (`internal/bcch-api/`):
- `client.go` - HTTP client with 1-minute timeout and cache integration
- `bcchapi.go` - Core API methods for series data retrieval
- `authconfig.go` - Credential management and authentication
- `series_req.go` - API request/response handling
- `types_series.go` - Data structure definitions

**Caching System** (`internal/bcch-cache/`):
- Time-based cache with 24-hour default expiration
- Automatic cleanup (reaping) of expired entries
- Thread-safe operations for concurrent access

### Configuration Constants
- Client timeout: 1 minute
- Cache interval: 24 hours
- Default visualization port: 49966 (only applicable to the viz command and it can be modified with the -p flag) 
- Default visualization set: "EMPLOYMENT" - This is a predefined set of series that are intended to be shown in the browser through specific visualizations (pre-defined too for this set of series) after running the cmd command specified in `bcch/cmd/viz.go`

### Predefined Series Sets
The application includes predefined sets of economic indicators (defined in `bcch/cmd/root.go:30`):
- `EMPLOYMENT` - Employment relation between different regions with 8 series IDs (

## Visual Development

### Dual Rendering System

The visualization dashboard supports **two rendering engines** that can be toggled in the browser:

1. **Chart.js (JavaScript)** - Interactive, client-side charts with hover tooltips and animations
2. **Matplotlib (Python)** - Publication-quality static images generated server-side

### Architecture

- Hybrid HTTP server serving both static files and REST API endpoints
- Static files: HTML, CSS, JS from `public/` directory (embedded in binary)
- API endpoints: `/api/sets/{set}` for dynamic data fetching from BCCh
- Automatic browser opening after 2-second delay
- Configurable port (default 49966)
- Data flows:
  - **Chart.js**: CLI → HTTP Server → API Endpoint → BCCh API → JSON Response → Frontend Charts
  - **Matplotlib**: CLI → Python Script → PNG/SVG Images → Served by HTTP Server

### Python/Matplotlib Setup

**Prerequisites:**
1. Install [uv](https://github.com/astral-sh/uv) - Fast Python package installer
   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
2. Python 3.11+

**First-time setup:**
```bash
cd bcch/python
uv sync  # Installs matplotlib, numpy, creates venv
```

**How it works:**
- When running `bcch viz`, the Go server automatically calls Python via `uv run`
- Python generates matplotlib charts as PNG files in `bcch/public/img/`
- Charts are served alongside the HTML page
- Users can toggle between Chart.js and Matplotlib in the browser
- If Python/uv is not available, the system gracefully falls back to Chart.js only

### Matplotlib Playground

The `bcch/python/charts/` directory contains modular chart generation scripts:
- `unemployment.py` - Unemployment + Imacec dual Y-axis chart
- `exchange.py` - Exchange rate + Copper price chart
- `cpi.py` - CPI comparison (Chile vs USA)

Each file is heavily commented with `PLAYGROUND` markers showing customization opportunities:
- Color schemes and palettes
- Line styles and markers
- Annotations and statistical overlays
- Grid and axis styling
- Legend positioning

**Development workflow:**
1. Edit chart modules in `bcch/python/charts/`
2. Run `bcch viz` to regenerate charts
3. Toggle between Chart.js and Matplotlib in browser to compare
4. Iterate and refine

See `bcch/python/README.md` for detailed Python setup and customization guide.

**MUST** use the dev tool to disable cache and thus being able to see the changes whenever refreshing the page.

-- Template for a python notebook with the plot of graphs that are of interest in regard of the *EMPLOYMENT* set https://github.com/iferdel-vault/chile-economic-indicators/blob/main/Chile_economic_indicators_project.ipynb

### Design Principles
- Comprehensive design checklist in `.claude/context/design-principles.md`
- Brand style guide in `.claude/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view.
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@agent-design-review` subagent for thorough design validation when:
- Completing significant UI/UX features
- Needing comprehensive accessibility and responsiveness testing


