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
	series map[string]bcchapi.SeriesDataResp
	mu     *sync.Mutex
	wg     *sync.WaitGroup
}

func configure() *config {

	m := make(map[string]bcchapi.SeriesDataResp)
	m["F032.IMC.IND.Z.Z.EP13.Z.Z.0.M"] = bcchapi.SeriesDataResp{}
	m["F074.IPC.VAR.Z.Z.C.M"] = bcchapi.SeriesDataResp{}
	m["F019.IPC.V12.10.M"] = bcchapi.SeriesDataResp{}
	m["F019.PPB.PRE.100.D"] = bcchapi.SeriesDataResp{}
	m["F073.TCO.PRE.Z.D"] = bcchapi.SeriesDataResp{}
	m["F049.DES.TAS.INE9.10.M"] = bcchapi.SeriesDataResp{}
	m["F049.DES.TAS.INE9.26.M"] = bcchapi.SeriesDataResp{}
	m["F049.DES.TAS.INE9.12.M"] = bcchapi.SeriesDataResp{}

	return &config{
		client: bcchapi.NewClient(clientTimeout, bcchCacheInterval),
		series: m,
		mu:     &sync.Mutex{},
		wg:     &sync.WaitGroup{},
	}
}
