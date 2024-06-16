package bcchcache

import (
	"testing"
	"time"
)

func TestCreateCache(t *testing.T) {
	const interval = 5 * time.Second
	cache := NewCache(interval)
	if cache.cache == nil {
		t.Error("shouldn't return nil cache map")
	}
}
