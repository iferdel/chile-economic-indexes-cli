package main

import (
	"encoding/json"
	"fmt"
	"os"
)

func loadSearch(cfg *config, filename string) error {
	dat, err := os.ReadFile(filename)
	if err != nil {
		return err
	}
	err = json.Unmarshal(dat, &cfg.lastAvailableSeries)
	if err != nil {
		return err
	}
	return nil
}

func saveSearch(cfg *config, filename string) error {
	data, err := json.MarshalIndent(cfg.lastAvailableSeries, "", " ")
	if err != nil {
		return err
	}
	if f, err := os.Create(filename); err == nil {
		defer f.Close()
		_, err := f.Write(data)
		if err != nil {
			return fmt.Errorf("error saving searched series before exiting CLI")
		}
	}
	return nil
}

func commandSearchSeries(cfg *config, args ...string) error {

    defer saveSearch(cfg, searchHistoryFile)

	creds := cfg.bcchapiClient.AuthConfig
	if creds.User == "" || creds.Password == "" {
		return fmt.Errorf("you need to first set your BCCH credentials to use this command, see 'help' for details")
	}

	if len(args) == 0 {
		return fmt.Errorf("usage: search <frequency>, see 'help for details'")
	}
	availableSeries, err := cfg.bcchapiClient.GetAvailableSeries(args[0])
	if err != nil {
		return err
	}

	if availableSeries.Codigo != 0 {
		return fmt.Errorf(availableSeries.Descripcion)
	}

	for _, serie := range availableSeries.SeriesInfos {
		fmt.Printf("- %v\n", serie.SpanishTitle)
	}
    

	return nil
}
