package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var viz = &cobra.Command{
	Use:   "viz",
	Short: "Launch a visualization for a set of series",
	Long: `
		Start a local server intended to visualize series data.

		This command opens an static environment where you can
visualize trends of a variety of predefined sets of series
that are fetched from the BCCh API.

By default, the server runs on http://localhost:49966, 
but you can configure the port and other options with flags.

To check which set of series are available in this version,
take a look at 'search --predefined'
	`,
	GroupID: "1",
	Example: "bcch viz UN --detached",
	Run: withSpinnerWrapper(cfg.spinner, func(cmd *cobra.Command, args []string) {
		err := cfg.bcchapiClient.AuthConfig.Load()
		if err != nil {
			fmt.Printf("error loading credentials: %v\n", err)
			return
		}
	}),
}

func init() {
	// first uses only one 'fetch' function that fetches
	// one set of data series from BCCh api
	// then it can be extended with other 'sets'
	// and also with flags such as 'detached mode'
	rootCmd.AddCommand(viz)
}
