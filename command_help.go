package main

import "fmt"

func commandHelp(cfg *config, args ...string) error {
	if user := cfg.bcchapiClient.AuthConfig.User; user == "" {
		fmt.Println("You are not yet logged with any username. Start with login command.")
	} else {
		fmt.Printf("Connected as %q\n", user)
	}

	fmt.Println("This is the help menu for the Chile Economic Indexes CLI tool")
	fmt.Println("All available commands are listed below:")

	availableCommands := getCommands()
	for _, command := range availableCommands {
		fmt.Printf(" - %s: %s\n", command.name, command.description)
	}
	fmt.Println("")
	fmt.Println("Use --help flag after every command to get more information")
	fmt.Println("")

	return nil
}
