package bcchapi

import (
	"encoding/json"
	"os"
)

func SaveSeriesToJSON(payload map[string]SeriesDataResp, filename string) error {
	file, err := os.Create(filename)
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
