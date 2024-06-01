package main

import "fmt"

func commandLogin(cfg *config, args ...string) error {

	if len(args) != 2 {
		return fmt.Errorf("usage: login <user> <password>")
	}

	cfg.bcchapiClient.AuthConfig.User = args[0]
	cfg.bcchapiClient.AuthConfig.Password = args[1]

	return nil

}
