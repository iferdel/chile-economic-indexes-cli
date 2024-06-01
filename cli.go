package main

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"strings"
)

var errExit = errors.New("exit from cli tool requested")

func CLI(cfg *config) {
	scanner := bufio.NewScanner(os.Stdin)
	for {
		fmt.Print("bcch >")

		scanner.Scan()

		userInput := scanner.Text()
		cleanedInput := cleanInput(userInput)

		if len(cleanedInput) == 0 {
			continue
		}

		commandName := cleanedInput[0]
		command, ok := getCommands()[commandName]

		if !ok {
			fmt.Println("Command not available, see 'help'")
			continue
		}

		args := []string{}
		if len(cleanedInput) > 1 {
			args = cleanedInput[1:]
		}

		err := command.callback(cfg, args...)
		if err != nil {
			if err == errExit {
				break
			}
			fmt.Println(err)
			continue
		}
	}
}

func cleanInput(input string) []string {
	words := strings.Fields(input)
	return words
}

type cliCommand struct {
	name        string
	description string
	callback    func(*config, ...string) error
}

func getCommands() map[string]cliCommand {
	return map[string]cliCommand{
		"help": {
			name:        "help",
			description: "This is the help of the cli tool",
			callback:    commandHelp,
		},
		"exit": {
			name:        "exit",
			description: "exits the cli tool",
			callback:    commandExit,
		},
		"login": {
			name:        "login",
			description: "set credentials to requests to the BCCH",
			callback:    commandLogin,
		},
		"search": {
			name:        "search",
			description: "it shows the available series to fetch based on a frequency: DAILY, MONTHLY, QUARTERLY o ANNUAL",
			callback:    commandSearchSeries,
		},
	}
}
