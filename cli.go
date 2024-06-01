package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func CLI() {
	scanner := bufio.NewScanner(os.Stdin)
	for {
		fmt.Print("bcch >")

		scanner.Scan()

		userInput := scanner.Text()
		cleanedInput := cleanInput(userInput)

		fmt.Println(cleanedInput)
	}
}

func cleanInput(input string) []string {
	words := strings.Fields(input)
	return words
}
