all: fmt test vet staticcheck gosec

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
