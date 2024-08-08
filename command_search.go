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
	keywordPtr := flagset.String("keyword", "", "keyword for filtering")
	err = flagset.Parse(args[1:])
	if err != nil {
		return err
	}

	// placeholder for spinner last symbol
	fmt.Println("")

	if *keywordPtr != "" {
		for _, serie := range availableSeries.SeriesInfos {
			if strings.Contains(serie.SpanishTitle, *keywordPtr) {
                fmt.Printf("- %v: %v\n", serie.SeriesID, serie.SpanishTitle)
			}
		}
		return nil
	}

	for _, serie := range availableSeries.SeriesInfos {
		fmt.Printf("- %v: %v\n", serie.SeriesID, serie.SpanishTitle)
	}

	return nil
}
