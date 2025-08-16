package bcchapi

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

const bcchCredentials = ".bcch_credentials" // #nosec G101

type AuthConfig struct {
	User     string `json:"user"`
	Password string `json:"password"`
}

// Loads credentials into the given AuthConfig struct
func (a *AuthConfig) Load() error {
	dat, err := os.ReadFile(filepath.Clean(bcchCredentials))
	if err != nil {
		return errors.New("no credentials yet saved, use 'set-credentials' to save")
	}
	return json.Unmarshal(dat, a)
}

// Saves authconfig back to disk
func (a *AuthConfig) Save() error {
	data, err := json.MarshalIndent(a, "", "  ")
	if err != nil {
		return err
	}
	f, err := os.Create(filepath.Clean(bcchCredentials))
	if err != nil {
		return err
	}
	defer f.Close()
	if _, err = f.Write(data); err != nil {
		return errors.New("error saving credentials")
	}
	return nil
}
