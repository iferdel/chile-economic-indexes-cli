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
- `internal/bcch-api/` - BCCh API client with authentication and HTTP handling
- `internal/bcch-cache/` - Time-based caching system for API responses (24h default)
- `internal/fileio/` - JSON file operations for data export
- `internal/spinner/` - Loading spinner for user experience
- `public/` - Static files for the visualization web server

### Key Components

**CLI Commands** (`bcch/cmd/`):
- `root.go` - Main command configuration with predefined series sets
- `search.go` - Search available data series with keyword/frequency filtering
- `get.go` - Retrieve specific series data by ID
- `setcredentials.go` - Store BCCh API credentials locally
- `viz.go` - Fetch a data set (multiple series of data) into a `series.json` inside `public/` folder, after that it launches a local visualization server with browser integration so the user can visalize pre-defined graphs for that specific data set
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
- Local HTTP server serving static visualization files
- Automatic browser opening after 2-second delay
- JSON data export for visualization consumption
- Configurable port (default 49966)

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


