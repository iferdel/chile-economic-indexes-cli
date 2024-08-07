package main

import "errors"

var errExit = errors.New("exit from cli tool requested")

func commandExit(cfg *config, args ...string) error {
	return errExit
}
