package main

import "fmt"

func commandSearchSeries(cfg *config) error {

	creds := cfg.bcchapiClient.AuthConfigs
	if len(creds) == 0 {
		return fmt.Errorf("you need to log in to use this command")
	}

	fmt.Println("passed cred check")
	_, err := cfg.bcchapiClient.GetAvailableSeries()
	if err != nil {
		return err
	}

	return nil
}
