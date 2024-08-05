package main

import "time"

const (
	clientTimeout     = time.Minute
	bcchCredentials   = ".bcch_credentials" // #nosec G101
	bcchCacheInterval = 24 * time.Hour
)
