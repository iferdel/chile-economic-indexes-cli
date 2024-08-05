package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

// BCCH does not have any login feature, but the url for api requests uses the credentials.
func commandSetCredentials(cfg *config, args ...string) error {

	flagset := flag.NewFlagSet("set-credentials", flag.ContinueOnError)
	userPtr := flagset.String("u", "", "user")
	passwordPtr := flagset.String("p", "", "password")

	err := flagset.Parse(args) // Parse method uses a flag type
	if err != nil {
		return err
	}

	defer saveLocalCredentials(cfg, bcchCredentials)
	if *userPtr == "" && *passwordPtr == "" {
		return fmt.Errorf("usage: set-credentials -u <user> -p <password>")
	}

	cfg.bcchapiClient.AuthConfig.User = *userPtr
	cfg.bcchapiClient.AuthConfig.Password = *passwordPtr

	fmt.Println("saved credentials!")

	return nil
}

func loadLocalCredentials(cfg *config, filename string) error {
	dat, err := os.ReadFile(filepath.Clean(filename))
	if err != nil {
		return errors.New("no credentials yet saved, 'set-credentials' saves credentials for future sessions")
	}

	err = json.Unmarshal(dat, &cfg.bcchapiClient.AuthConfig)
	if err != nil {
		return err
	}
	return nil

}

func saveLocalCredentials(cfg *config, filename string) error {
	data, err := json.MarshalIndent(cfg.bcchapiClient.AuthConfig, "", "  ")
	if err != nil {
		return err
	}
	if f, err := os.Create(filepath.Clean(filename)); err == nil {
		defer f.Close()
		_, err := f.Write(data)
		if err != nil {
			return fmt.Errorf("error saving credentials before exiting CLI")
		}
	}
	return nil
}
