package main

import (
	"sync"
	"time"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
)

const (
	clientTimeout     = time.Minute
	bcchCredentials   = ".bcch_credentials" // #nosec G101
	bcchCacheInterval = 24 * time.Hour
)

type config struct {
	client *bcchapi.Client
	series []string
	mu     *sync.Mutex
	wg     *sync.WaitGroup
}

func configure() *config {

	seriesIDs := []string{
		"F032.IMC.IND.Z.Z.EP13.Z.Z.0.M",
		"F074.IPC.VAR.Z.Z.C.M",
		"F019.IPC.V12.10.M",
		"F019.PPB.PRE.100.D",
		"F073.TCO.PRE.Z.D",
		"F049.DES.TAS.INE9.10.M",
		"F049.DES.TAS.INE9.26.M",
		"F049.DES.TAS.INE9.12.M",
	}

	return &config{
		client: bcchapi.NewClient(clientTimeout, bcchCacheInterval),
		series: seriesIDs,
		mu:     &sync.Mutex{},
		wg:     &sync.WaitGroup{},
	}
}
