package main

import "github.com/iferdel/chile-economic-indexes-cli/bcch/cmd"

var version = "dev"

func main() {
	cmd.SetVersion(version)
	cmd.Execute() // #nosec G104
}
