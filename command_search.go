package main

import (
	"flag"
	"fmt"
	"strings"
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

	flagset := flag.NewFlagSet("search-keyword", flag.ContinueOnError)
	keywordPtr := flagset.String("w", "", "keyword for titles matching")
	err = flagset.Parse(args[1:])
	if err != nil {
		return err
	}
	if *keywordPtr != "" {
		for _, serie := range availableSeries.SeriesInfos {
			if strings.Contains(serie.SpanishTitle, *keywordPtr) {
				fmt.Printf("- %v\n", serie.SpanishTitle)
			}
		}
		return nil
	}

	for _, serie := range availableSeries.SeriesInfos {
		fmt.Printf("- %v\n", serie.SpanishTitle)
	}

	return nil
}
