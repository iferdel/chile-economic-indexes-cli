package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/iferdel/chile-economic-indexes-cli/internal/spinner"
)

func CLI(cfg *config) {

    s := spinner.New(spinner.Config{})
	scanner := bufio.NewScanner(os.Stdin)

	// persistent credentials from last session by autogenerated localfile
	err := loadLocalCredentials(cfg, bcchCredentials)
	if err != nil {
		fmt.Println(err)
	}

	if user := cfg.bcchapiClient.AuthConfig.User; user == "" {
		fmt.Println("You havent set any credentials. Start with 'set-credentials' command.")
	} else {
		fmt.Printf("Connected as %q\n", user)
	}

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
        
        s.Start()
		err := command.callback(cfg, args...)
		if err != nil {
			if err == errExit {
				break
			}
			fmt.Println(err)
			continue
		}
        s.Stop()
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
		"set-credentials": {
			name:        "set-credentials",
			description: "set credentials to requests to the BCCH",
			callback:    commandSetCredentials,
		},
		"search": {
			name:        "search",
			description: "it shows the available series to fetch based on a frequency: DAILY, MONTHLY, QUARTERLY o ANNUAL",
			callback:    commandSearchSeries,
		},
	}
}
