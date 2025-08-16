// crawler/main.go
package main

import (
	"fmt"
	"log"
)

func main() {
	cfg := configure()
	err := cfg.client.AuthConfig.Load()
	if err != nil {
		log.Fatalf("error loading credentials: %q", err)
	}
	fmt.Println("starting crawl of BCCh API")
	fmt.Println("===============================")
	cfg.crawlSeries()
}
