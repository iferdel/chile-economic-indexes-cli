![ci test badge](https://github.com/iferdel/chile-economic-indexes-cli/actions/workflows/tests.yml/badge.svg?event=pull_request)

One major reference in terms of structure and the alike is the [Docker CLI GitHub repository](https://github.com/docker/cli)

The first release version will rely entirely on the Go standard library. Subsequent versions will incrementally incorporate external libraries.
Here's the roadmap of tools planned to be used:
- [Liner](https://github.com/peterh/liner) for command line editing with history.
- [Cobra](https://github.com/spf13/cobra) for modern Go CLI applications.
- [Bubble Tea](https://github.com/charmbracelet/bubbletea) for interactive CLI applications.
- [VHS](https://github.com/charmbracelet/vhs) for documentation


CI is managed using GitHub Actions. Releases are handled by [GoReleaser](https://github.com/goreleaser/goreleaser) via [GitHub Actions](https://goreleaser.com/ci/actions/)
