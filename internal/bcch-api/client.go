package bcchapi

import (
	"net/http"
	"time"
)

type Client struct {
	httpClient http.Client
	user       string
	password   string
}

func NewClient(timeout time.Duration) Client {
	return Client{
		httpClient: http.Client{
			Timeout: timeout,
		},
		user:     "",
		password: "",
	}
}
