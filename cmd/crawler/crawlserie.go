package main

import (
	"encoding/json"
	"fmt"
	"os"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
)

const filename = "series.json"

func (cfg *config) crawlSeries() {
	seriesData, seriesErrors := cfg.client.GetMultipleSeriesData(cfg.series, "", "")

	for _, err := range seriesErrors {
		if err != nil {
			fmt.Printf("Error: %v\n", err)
		}
	}

	if err := seriesToJSON(seriesData, filename); err != nil {
		fmt.Printf("Failed to save JSON: %v\n", err)
	}
	return
}

func seriesToJSON(payload map[string]bcchapi.SeriesDataResp, filename string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")

	if err := encoder.Encode(payload); err != nil {
		return err
	}
	return nil
}
