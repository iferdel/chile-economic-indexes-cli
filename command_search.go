package main

import (
	"fmt"
)

func commandSearchSeries(cfg *config, args ...string) error {

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
