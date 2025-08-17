package main

import (
	"fmt"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
)

const filename = "series.json"

func (cfg *config) fetchSeries(MaxConcurrency int) {
	seriesData, seriesErrors := cfg.client.GetMultipleSeriesData(cfg.series, "", "", &bcchapi.FetchOptions{MaxConcurrency: MaxConcurrency})
	for _, err := range seriesErrors {
		if err != nil {
			fmt.Printf("Error: %v\n", err)
		}
	}

	if err := bcchapi.SaveSeriesToJSON(seriesData, filename); err != nil {
		fmt.Printf("Failed to save JSON: %v\n", err)
	}
	return
}
