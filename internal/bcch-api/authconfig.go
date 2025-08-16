package bcchapi

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

type AuthConfig struct {
	User     string `json:"user"`
	Password string `json:"password"`
}

// Loads credentials into the given AuthConfig struct
func (a *AuthConfig) Load(filename string) error {
	dat, err := os.ReadFile(filepath.Clean(filename))
	if err != nil {
		return errors.New("no credentials yet saved, use 'set-credentials' to save")
	}
	return json.Unmarshal(dat, a)
}

// Saves authconfig back to disk
func (a *AuthConfig) Save(filename string) error {
	data, err := json.MarshalIndent(a, "", "  ")
	if err != nil {
		return err
	}
	f, err := os.Create(filepath.Clean(filename))
	if err != nil {
		return err
	}
	defer f.Close()
	if _, err = f.Write(data); err != nil {
		return errors.New("error saving credentials")
	}
	return nil
}
