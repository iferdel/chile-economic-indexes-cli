package bcchapi

import (
	"net/http"
	"time"
)

type Client struct {
	httpClient  http.Client
	AuthConfigs map[string]AuthConfig
}

func NewClient(timeout time.Duration) Client {
	return Client{
		httpClient: http.Client{
			Timeout: timeout,
		},
		AuthConfigs: make(map[string]AuthConfig),
	}
}
