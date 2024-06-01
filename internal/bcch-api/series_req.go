package bcchapi

import (
	"fmt"
	"net/http"
)

func (c *Client) GetAvailableSeries() (AvailableSeriesResp, error) {

	endpoint := fmt.Sprintf("SieteRestWS.ashx?user=%s&pass=%s&function=SearchSeries&frequency=QUATERLY",
		c.user,
		c.password,
	)
	fullURL := baseURL + endpoint

	availableSeries := AvailableSeriesResp{}

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

	return availableSeries, nil
}
