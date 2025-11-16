package main

import (
	"embed"

	"github.com/iferdel/chile-economic-indexes-cli/v3/bcch/cmd"
)

//go:embed public/*.html public/*.css public/*.js
var PublicEmbeddedFS embed.FS

var version = "dev"

func main() {
	cmd.SetVersion(version)
	cmd.Execute(PublicEmbeddedFS) // #nosec G104
}
