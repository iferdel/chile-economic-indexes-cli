package cmd

import (
	"fmt"
	"maps"
	"slices"
	"strings"

	"github.com/spf13/cobra"
)

var searchCmd = &cobra.Command{
	Use:   "search",
	Short: "Search the whole list of available data series to be queried.",
	Long:  `Every data series has their own ID which may be used on get command to retrieve its data.`,
	Run: withSpinnerWrapper(cfg.spinner, func(cmd *cobra.Command, args []string) {
		predefinedSetsFlag, _ := cmd.Flags().GetBool("predefined-sets")
		
		if predefinedSetsFlag {
			fmt.Println("Available predefined sets for visualization:")
			setNames := slices.Sorted(maps.Keys(AvailableSetsSeries))
			for _, setName := range setNames {
				set := AvailableSetsSeries[setName]
				fmt.Printf("- %s: %s\n", setName, set.Description)
			}
			return
		}

		err := cfg.bcchapiClient.AuthConfig.Load()
		if err != nil {
			fmt.Printf("error loading credentials: %v\n", err)
			return
		}
		creds := cfg.bcchapiClient.AuthConfig
		if creds.User == "" || creds.Password == "" {
			fmt.Println("you need to first set your BCCH credentials to use this command, see 'help' for details")
		}

		frequencyFlag, _ := cmd.Flags().GetString("frequency")
		keywordFlag, _ := cmd.Flags().GetString("keyword")

		validFrequencies := []string{"DAILY", "MONTHLY", "QUARTERLY", "ANNUAL"}
		found := false
		for _, freq := range validFrequencies {
			if frequencyFlag == freq {
				found = true
				break
			}
		}
		if !found {
			fmt.Println("--frequency must be one of: DAILY, MONTHLY, QUARTERLY, ANNUAL.")
			return
		}

		availableSeries, _ := cfg.bcchapiClient.GetAvailableSeries(frequencyFlag)

		if availableSeries.Codigo != 0 {
			fmt.Println(availableSeries.Descripcion)
		}
		// placeholder for spinner last symbol
		fmt.Println("")

		if keywordFlag != "" {
			for _, serie := range availableSeries.SeriesInfos {
				if strings.Contains(serie.SpanishTitle, keywordFlag) {
					fmt.Printf("- %v: %v\n", serie.SeriesID, serie.SpanishTitle)
				}
			}
		} else {
			for _, serie := range availableSeries.SeriesInfos {
				fmt.Printf("- %v: %v\n", serie.SeriesID, serie.SpanishTitle)
			}
		}
	}),
}

func init() {
	rootCmd.AddCommand(searchCmd)
	searchCmd.Flags().StringP("frequency", "f", "", "Frequency of the data: DAILY, MONTHLY, QUARTERLY, or ANNUAL")
	searchCmd.Flags().StringP("keyword", "k", "", "Keyword to be used to filter the list of series")
	searchCmd.Flags().Bool("predefined-sets", false, "List available predefined sets for visualization")
}
