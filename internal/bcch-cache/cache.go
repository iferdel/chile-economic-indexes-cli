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
	go c.reapLoop(interval)
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

func (c *Cache) reapLoop(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for range ticker.C {
		c.reap(interval) // NewTicker ticks whenever the interval is met
	}
}

func (c *Cache) reap(interval time.Duration) {
	currentTime := time.Now().UTC()
	for key, entry := range c.cache {
		if currentTime.Sub(entry.createdAt) > interval {
			delete(c.cache, key)
		}
	}
}
