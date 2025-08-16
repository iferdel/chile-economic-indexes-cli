package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

const bcchcreds = ".bcch_credentials"

func loadLocalCredentials(cfg *config, filename string) error {
	dat, err := os.ReadFile(filepath.Clean(filename))
	if err != nil {
		return errors.New("no credentials yet saved, 'set-credentials' saves credentials for future sessions")
	}

	err = json.Unmarshal(dat, &cfg.client.AuthConfig)
	if err != nil {
		return err
	}
	return nil

}

func main() {
	cfg := configure()
	loadLocalCredentials(cfg, bcchcreds)
	fmt.Println("starting crawl of BCCh API")
	fmt.Println("===============================")
	cfg.crawlSeries()
}
