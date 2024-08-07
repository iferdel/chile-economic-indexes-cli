package main

import "fmt"

func commandHelp(cfg *config, args ...string) error {

	fmt.Println("This is the help menu for the Chile Economic Indexes CLI tool")
	fmt.Println("All available commands are listed below:")

	availableCommands := cfg.getCommands()
	for _, command := range availableCommands {
		fmt.Printf(" - %s: %s\n", command.name, command.description)
	}
	fmt.Println("")
	fmt.Println("Use --help flag after every command to get more information")
	fmt.Println("")

	return nil
}
