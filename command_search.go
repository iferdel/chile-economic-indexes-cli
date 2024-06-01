package main

func commandSearchSeries(cfg *config) error {
	_, err := cfg.bcchapiClient.GetAvailableSeries()
	if err != nil {
		return err
	}
	return nil
}
