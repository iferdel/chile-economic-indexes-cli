package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

func commandLogin(cfg *config, args ...string) error {

	defer saveLocalCredentials(cfg, bcchCredentials)
	if len(args) != 2 {
		return fmt.Errorf("usage: login <user> <password>")
	}

	cfg.bcchapiClient.AuthConfig.User = args[0]
	cfg.bcchapiClient.AuthConfig.Password = args[1]

	return nil

}

func loadLocalCredentials(cfg *config, filename string) error {
	dat, err := os.ReadFile(filepath.Clean(filename))
	if err != nil {
		return err
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
