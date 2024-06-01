package main

import "fmt"

func commandHelp() error {
	fmt.Println("This is the help menu for the Chile Economic Indexes CLI tool")
	fmt.Println("All available commands are listed below:")

	availableCommands := getCommands()
	for _, command := range availableCommands {
		fmt.Printf(" - %s: %s\n", command.name, command.description)
	}
	fmt.Println("")

	return nil
}