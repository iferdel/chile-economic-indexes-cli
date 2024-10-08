package bcchapi

import (
	"net/http"
	"time"

	bcchcache "github.com/iferdel/chile-economic-indexes-cli/bcch/internal/bcch-cache"
)

type Client struct {
	cache      bcchcache.Cache
	httpClient http.Client
	AuthConfig AuthConfig
}

func NewClient(timeout, cacheInterval time.Duration) Client {
	return Client{
		cache: bcchcache.NewCache(cacheInterval),
		httpClient: http.Client{
			Timeout: timeout,
		},
		AuthConfig: AuthConfig{},
	}
}
