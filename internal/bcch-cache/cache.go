package bcchcache

import (
	"fmt"
	"sync"
	"time"
)

type Cache struct {
	cache map[string]cacheEntry
	mux   *sync.Mutex
}

type cacheEntry struct {
	createdAt time.Time
	value     []byte
}

func NewCache(interval time.Duration) Cache {
	c := Cache{
		cache: make(map[string]cacheEntry),
		mux:   &sync.Mutex{},
	}
	go c.reapLoop(interval)
	return c
}

func (c *Cache) Add(key string, value []byte) error {
	c.mux.Lock()
	defer c.mux.Unlock()

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
	c.mux.Lock()
	defer c.mux.Unlock()

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
	c.mux.Lock()
	defer c.mux.Unlock()

	currentTime := time.Now().UTC()
	for key, entry := range c.cache {
		if currentTime.Sub(entry.createdAt) > interval {
			delete(c.cache, key)
		}
	}
}
