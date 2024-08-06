package main

import (
	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
	"github.com/iferdel/chile-economic-indexes-cli/internal/spinner"
	"github.com/peterh/liner"
)

type config struct {
	CLILiner      *liner.State
	bcchapiClient bcchapi.Client
	spinner       *spinner.Spinner
}

func main() {
	s := spinner.New(spinner.Config{})
	cfg := &config{
		bcchapiClient: bcchapi.NewClient(clientTimeout, bcchCacheInterval),
		spinner:       s,
	}
	CLI(cfg)
}
