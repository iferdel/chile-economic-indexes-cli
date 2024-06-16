package main

import (
	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
)

type config struct {
	bcchapiClient       bcchapi.Client
	lastAvailableSeries bcchapi.AvailableSeriesResp
}

func main() {
	cfg := &config{
		bcchapiClient: bcchapi.NewClient(clientTimeout, bcchCacheInterval),
	}
	CLI(cfg)
}
