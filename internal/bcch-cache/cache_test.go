package bcchcache

import (
	"fmt"
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

func TestAddGet(t *testing.T) {
	const interval = 5 * time.Second
	cases := []struct {
		key string //endpoint
		val []byte //content
	}{
		{
			key: "https://example.com",
			val: []byte("test-data"),
		},
		{
			key: "",
			val: []byte(""),
		},
	}

	for i, c := range cases {
		t.Run(fmt.Sprintf("test case %v", i), func(t *testing.T) {

			cache := NewCache(interval)

			err := cache.Add(c.key, c.val)
			if c.key == "" {
				if err == nil {
					t.Errorf("expected error caused by empty key to be added in cache")
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error adding key %v in test case %v: %v", c.val, i, err)
				return
			}

			got, ok := cache.Get(c.key)
			if !ok {
				t.Errorf("expected key %v to be found in test case %v", c.key, i)
				return
			}

			if string(got) != string(c.val) {
				t.Errorf("expected value %v, but got %v value", c.val, got)
			}

		})
	}
}

func TestReapPass(t *testing.T) {
	interval := 1 * time.Second
	c := NewCache(interval)

	key, value := "https://example.com", []byte("test")
	c.Add(key, value)

	time.Sleep(interval + time.Millisecond)

	retrievedData, ok := c.Get(key)

	if ok {
		t.Errorf("not expected to find %v: %v", key, retrievedData)
	}
}

func TestReapFail(t *testing.T) {
	interval := 1 * time.Second
	c := NewCache(interval)

	key, value := "https://example.com", []byte("test")
	c.Add(key, value)

	time.Sleep(interval / 2)

	retrievedData, ok := c.Get(key)

	if !ok {
		t.Errorf("expected to find %v: %v", key, retrievedData)
	}
}
