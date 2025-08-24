VERSION := $(shell git describe --tags --abbrev=0 2>/dev/null || echo "dev")

all: fmt test vet staticcheck gosec

build:
	go build -ldflags "-X main.version=$(VERSION)" -o bin/bcch ./bcch

fmt:
	test -z $(go fmt ./...)

test:
	go test -v ./...

vet:
	go vet ./...

staticcheck:
	staticcheck ./...

gosec:
	gosec ./...
