package bcchapi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
)

type FetchOptions struct {
	MaxConcurrency int
}

func (c *Client) GetAvailableSeries(seriesFrequency string) (AvailableSeriesResp, error) {

	endpoint := fmt.Sprintf("SieteRestWS.ashx?user=%s&pass=%s&function=SearchSeries&frequency=%s",
		c.AuthConfig.User,
		c.AuthConfig.Password,
		seriesFrequency,
	)
	fullURL := baseURL + endpoint

	if cachedValues, ok := c.cache.Get(fullURL); ok {
		//cache hit
		AvailableSeries := AvailableSeriesResp{}
		err := json.Unmarshal(cachedValues, &AvailableSeries)
		if err != nil {
			return AvailableSeries, fmt.Errorf("on cache hit: error during unmarshal of body (JSON): %v", err)
		}
		return AvailableSeries, nil
	}

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return AvailableSeriesResp{}, fmt.Errorf("error making get request: %v", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return AvailableSeriesResp{}, fmt.Errorf("error during 'Do' of request: %v", err)
	}
	if resp.StatusCode > 399 {
		return AvailableSeriesResp{}, fmt.Errorf("status code over 399: %v", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		return AvailableSeriesResp{}, fmt.Errorf("error during reading of response body: %v", err)
	}

	AvailableSeries := AvailableSeriesResp{}
	err = json.Unmarshal(body, &AvailableSeries)
	if err != nil {
		return AvailableSeries, fmt.Errorf("error during unmarshal of body (JSON): %v", err)
	}

	return AvailableSeries, nil
}

func (c *Client) GetSeriesData(seriesID, firstDate, lastDate string) (SeriesDataResp, error) {
	endpoint := fmt.Sprintf("SieteRestWS.ashx?user=%s&pass=%s&function=GetSeries&timeseries=%s",
		c.AuthConfig.User,
		c.AuthConfig.Password,
		seriesID,
	)

	if firstDate != "" && lastDate != "" {
		endpoint += fmt.Sprintf("&firstdate=%s&lastdate=%s", firstDate, lastDate)
	} else if firstDate != "" {
		endpoint += fmt.Sprintf("&firstdate=%s", firstDate)
	} else if lastDate != "" {
		endpoint += fmt.Sprintf("&lastdate=%s", lastDate)
	}

	fullURL := baseURL + endpoint

	if cachedValues, ok := c.cache.Get(fullURL); ok {
		//cache hit
		SeriesDataResp := SeriesDataResp{}
		err := json.Unmarshal(cachedValues, &SeriesDataResp)
		if err != nil {
			return SeriesDataResp, fmt.Errorf("on cache hit: error during unmarshal of body (JSON): %v", err)
		}
		return SeriesDataResp, nil
	}
	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return SeriesDataResp{}, fmt.Errorf("error making get request: %v", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return SeriesDataResp{}, fmt.Errorf("error during 'Do' of request: %v", err)
	}
	if resp.StatusCode > 399 {
		return SeriesDataResp{}, fmt.Errorf("status code over 399: %v", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		return SeriesDataResp{}, fmt.Errorf("error during reading of response body: %v", err)
	}

	SeriesDataResp := SeriesDataResp{}
	err = json.Unmarshal(body, &SeriesDataResp)
	if err != nil {
		return SeriesDataResp, fmt.Errorf("error during unmarshal of body (JSON): %v", err)
	}

	return SeriesDataResp, nil
}

func (c *Client) GetMultipleSeriesData(seriesIDs []string, firstDate, lastDate string, opts *FetchOptions) (map[string]SeriesDataResp, map[string]error) {
	var seriesData = make(map[string]SeriesDataResp)
	var fetchErrors = make(map[string]error)
	var mu sync.Mutex
	var wg sync.WaitGroup

	maxConc := 3
	if opts != nil && opts.MaxConcurrency > 0 {
		maxConc = opts.MaxConcurrency
	}
	sem := make(chan struct{}, maxConc)

	for _, seriesID := range seriesIDs {
		wg.Add(1)
		go func(id string) {
			defer wg.Done()
			sem <- struct{}{}        // acquire slot
			defer func() { <-sem }() // release slot

			result, err := c.GetSeriesData(seriesID, firstDate, lastDate)
			mu.Lock()
			defer mu.Unlock()
			if err != nil {
				fetchErrors[seriesID] = err
				return
			}
			seriesData[seriesID] = result
		}(seriesID)
	}
	wg.Wait()
	return seriesData, fetchErrors
}
