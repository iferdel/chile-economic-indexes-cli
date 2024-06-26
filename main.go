package main

import (
	"time"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
)

type config struct {
	bcchapiClient bcchapi.Client
}

func main() {
	cfg := &config{
		bcchapiClient: bcchapi.NewClient(time.Minute),
	}
	CLI(cfg)
}
