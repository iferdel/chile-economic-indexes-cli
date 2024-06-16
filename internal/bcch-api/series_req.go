package bcchapi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

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
