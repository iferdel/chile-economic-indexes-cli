// crawler/main.go
package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("not enough arguments provided")
		fmt.Println("usage: bcchcrawler <maxConcurrency>")
		return
	}

	maxConcurrencyString := os.Args[1]
	maxConcurrency, err := strconv.Atoi(maxConcurrencyString)
	if err != nil {
		fmt.Printf("Error - maxConcurrency: %v", err)
		return
	}

	cfg := configure()
	err = cfg.client.AuthConfig.Load()
	if err != nil {
		log.Fatalf("error loading credentials: %q", err)
	}
	fmt.Println("starting crawl of BCCh API")
	fmt.Println("===============================")
	cfg.crawlSeries(maxConcurrency)
}
