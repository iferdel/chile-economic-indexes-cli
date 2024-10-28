# CLI Tool for Interacting with the Banco Central de Chile (BCCh) API

![ci test badge](https://github.com/iferdel/chile-economic-indexes-cli/actions/workflows/tests.yml/badge.svg?event=pull_request)

## General Description
This CLI tool allows you to set credentials and search for available data series from the Banco Central de Chile API using keywords. Once the data series of interest are identified, you can use their IDs to retrieve the corresponding data.

More information about the API can be found at [BCCh API para Base de Datos Estadísticos](https://si3.bcentral.cl/Siete/es/Siete/API?respuesta=)

![VHS based gif](https://vhs.charm.sh/vhs-4IK7xg53ifluMIMVRdtgRy.gif)

## Reason
One of the beauties of Go is its robust and versatile standard library. I noticed a lack of Go-based implementations for the Banco Central de Chile API, and this inspired me to develop a CLI tool as an entry point. This tool provides an easy-to-use interface, acting as a wrapper over the API to simplify data retrieval and interaction. By doing so, I aimed to explore the abstraction ladder of existing CLI libraries, starting from the Go standard library.

This CLI serves as a foundational project, offering an interactive and streamlined experience for users while also opening the door for future enhancements. It simplifies access to the data series, making it an ideal starting stone for developers looking to extend its capabilities or for anyone needing a convenient way to interact with the API.

## Version Roadmap
The first release (v1.x.x) will rely entirely on the Go standard library. Subsequent versions will incrementally incorporate external libraries.
Here's the roadmap of tools planned to be used:
- v2.x.x [Liner](https://github.com/peterh/liner) for command line editing with history.
- v3.x.x [Cobra](https://github.com/spf13/cobra) for modern Go CLI applications.
- v4.x.x [Bubble Tea](https://github.com/charmbracelet/bubbletea) for interactive CLI applications.
- [VHS](https://github.com/charmbracelet/vhs) for documentation

## 🚀 Quick Start
### Request your [BCCh credentials](https://si3.bcentral.cl/Siete/es/Siete/API?respuesta=)
Create an account with the BCCh (Banco Central de Chile) and activate your API credentials.
### Download the Executable
Visit the Releases section and download the compressed file that matches your OS/architecture setup. Inside the compressed file, you’ll find the executable.
### Start Using the CLI
After unzipping, refer to the executable from your terminal and type commands to get started. Begin with the basics by running:
```bash
<executable-file-name> help
```
*Note: To simplify command usage, you can add the executable to your PATH. This allows you to use a shorter command, such as bcch, instead of specifying the full path each time.*

## Additional Comments
One major reference in terms of structure and the alike are the [Docker CLI GitHub repository](https://github.com/docker/cli) and [BootDev CLI GitHub repository](https://github.com/bootdotdev/bootdev). CI is managed using GitHub Actions. Releases are handled by [GoReleaser](https://github.com/goreleaser/goreleaser) via [GitHub Actions](https://goreleaser.com/ci/actions/)

