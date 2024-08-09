# CLI Tool for Interacting with the Banco Central de Chile (BCCh) API

![ci test badge](https://github.com/iferdel/chile-economic-indexes-cli/actions/workflows/tests.yml/badge.svg?event=pull_request)

## General Description
This CLI tool allows you to set credentials and search for available data series from the Banco Central de Chile API using keywords. Once the data series of interest are identified, you can use their IDs to retrieve the corresponding data.

More information about the API can be found at [BCCh API para Base de Datos Estadísticos](https://si3.bcentral.cl/Siete/es/Siete/API?respuesta=)

![VHS based gif](https://vhs.charm.sh/vhs-4IK7xg53ifluMIMVRdtgRy.gif)

## Version Roadmap
The first release will rely entirely on the Go standard library. Subsequent versions will incrementally incorporate external libraries.
Here's the roadmap of tools planned to be used:
- [Liner](https://github.com/peterh/liner) for command line editing with history.
- [Cobra](https://github.com/spf13/cobra) for modern Go CLI applications.
- [Bubble Tea](https://github.com/charmbracelet/bubbletea) for interactive CLI applications.
- [VHS](https://github.com/charmbracelet/vhs) for documentation

## Additional Comments
One major reference in terms of structure and the alike is the [Docker CLI GitHub repository](https://github.com/docker/cli). CI is managed using GitHub Actions. Releases are handled by [GoReleaser](https://github.com/goreleaser/goreleaser) via [GitHub Actions](https://goreleaser.com/ci/actions/)
