package fileio

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

func SaveSeriesToJSON(payload any, filename string) error {
	// Validate filename to prevent path traversal
	cleanPath := filepath.Clean(filename)
	if strings.Contains(cleanPath, "..") || filepath.IsAbs(cleanPath) {
		return errors.New("invalid filename: path traversal or absolute path not allowed")
	}

	file, err := os.Create(cleanPath)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")

	if err := encoder.Encode(payload); err != nil {
		return err
	}
	return nil
}
