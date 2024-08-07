package main

import "fmt"

func commandGetSeriesData(cfg *config, args ...string) error {
	creds := cfg.bcchapiClient.AuthConfig
	if creds.User == "" || creds.Password == "" {
		return fmt.Errorf("you need to first set your BCCH credentials to use this command, see 'help' for details")
	}
	if len(args) == 0 {
		return fmt.Errorf("usage: get <series-id>")
	}
	seriesData, err := cfg.bcchapiClient.GetSeriesData(args[0])
	if err != nil {
		return err
	}

	if seriesData.Codigo != 0 {
		return fmt.Errorf(seriesData.Descripcion)
	}
	// placeholder for spinner last symbol
	fmt.Println("")
	for _, series := range seriesData.Series.Obs {
		fmt.Printf("%v - %v\n", series.IndexDateString, series.Value)
	}
	return nil
}
