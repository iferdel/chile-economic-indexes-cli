package main

import (
	"time"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
)

type config struct {
	bccapiClient bcchapi.Client
}

func main() {
	cfg := &config{
		bccapiClient: bcchapi.NewClient(time.Minute),
	}
	CLI(cfg)
}
