package bcchcache

import (
	"fmt"
	"time"
)

type Cache struct {
	cache map[string]cacheEntry
}

type cacheEntry struct {
	createdAt time.Time
	value     []byte
}

func NewCache(interval time.Duration) Cache {
	c := Cache{
		cache: make(map[string]cacheEntry),
	}
	return c
}

func (c *Cache) Add(key string, value []byte) error {
	if key == "" {
		return fmt.Errorf("cannot add empty key")
	}

	c.cache[key] = cacheEntry{
		createdAt: time.Now(),
		value:     value,
	}

	return nil
}

func (c *Cache) Get(key string) ([]byte, bool) {
	entry, ok := c.cache[key]
	return entry.value, ok
}
