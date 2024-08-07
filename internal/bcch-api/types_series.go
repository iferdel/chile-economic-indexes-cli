package bcchapi

type AvailableSeriesResp struct {
	Codigo      int    `json:"Codigo"`
	Descripcion string `json:"Descripcion"`
	Series      struct {
		DescripEsp any `json:"descripEsp"`
		DescripIng any `json:"descripIng"`
		SeriesID   any `json:"seriesId"`
		Obs        any `json:"Obs"`
	} `json:"Series"`
	SeriesInfos []struct {
		SeriesID         string `json:"seriesId"`
		FrequencyCode    string `json:"frequencyCode"`
		SpanishTitle     string `json:"spanishTitle"`
		EnglishTitle     string `json:"englishTitle"`
		FirstObservation string `json:"firstObservation"`
		LastObservation  string `json:"lastObservation"`
		UpdatedAt        string `json:"updatedAt"`
		CreatedAt        string `json:"createdAt"`
	} `json:"SeriesInfos"`
}

type SeriesDataResp struct {
	Codigo      int    `json:"Codigo"`
	Descripcion string `json:"Descripcion"`
	Series      struct {
		DescripEsp string `json:"descripEsp"`
		DescripIng string `json:"descripIng"`
		SeriesID   string `json:"seriesId"`
		Obs        []struct {
			IndexDateString string `json:"indexDateString"`
			Value           string `json:"value"`
			StatusCode      string `json:"statusCode"`
		} `json:"Obs"`
	} `json:"Series"`
	SeriesInfos []any `json:"SeriesInfos"`
}
