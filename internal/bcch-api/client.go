package bcchapi

import (
	"net/http"
	"time"
)

type Client struct {
	httpClient http.Client
	AuthConfig AuthConfig
}

func NewClient(timeout time.Duration) Client {
	return Client{
		httpClient: http.Client{
			Timeout: timeout,
		},
		AuthConfig: AuthConfig{},
	}
}
