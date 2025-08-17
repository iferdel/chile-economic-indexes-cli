package cmd

import (
	"fmt"
	"log"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
	"github.com/spf13/cobra"
)

var vizCmd = &cobra.Command{
	Use:   "viz",
	Short: "Launch a visualization for a set of series",
	Long: `
		Start a local server intended to visualize series data.

		This command opens an static environment where you can
visualize trends of a variety of predefined sets of series
that are fetched from the BCCh API.
`,
	// By default, the server runs on http://localhost:49966,
	// but you can configure the port and other options with flags.
	//
	// To check which set of series are available in this version,
	// take a look at 'search --predefined'
	// 	`,
	Example: "bcch viz",
	//Example: "bcch viz UN --detached",
	Run: withSpinnerWrapper(cfg.spinner, func(cmd *cobra.Command, args []string) {
		err := cfg.bcchapiClient.AuthConfig.Load()
		if err != nil {
			fmt.Printf("error loading credentials: %v\n", err)
			return
		}

		seriesIDs := []string{
			"F032.IMC.IND.Z.Z.EP13.Z.Z.0.M",
			"F074.IPC.VAR.Z.Z.C.M",
			"F019.IPC.V12.10.M",
			"F019.PPB.PRE.100.D",
			"F073.TCO.PRE.Z.D",
			"F049.DES.TAS.INE9.10.M",
			"F049.DES.TAS.INE9.26.M",
			"F049.DES.TAS.INE9.12.M",
		}

		cfg.fetchSeries(seriesIDs, "./public/series.json", 3)

		// can later use go for --detached mode
		if err := StartVizServer("./public/series.json"); err != nil {
			log.Fatalf("viz server error: %v", err)
		}
	}),
}

func init() {
	// first uses only one 'fetch' function that fetches
	// one set of data series from BCCh api
	// then it can be extended with other 'sets'
	// and also with flags such as 'detached mode'
	rootCmd.AddCommand(vizCmd)
}

// if filename is empty "", it saves it into memory?? --> redis?
func (cfg *config) fetchSeries(series []string, filename string, MaxConcurrency int) {
	seriesData, seriesErrors := cfg.bcchapiClient.GetMultipleSeriesData(series, "", "", &bcchapi.FetchOptions{MaxConcurrency: MaxConcurrency})
	for _, err := range seriesErrors {
		if err != nil {
			fmt.Printf("Error: %v\n", err)
		}
	}
	if err := bcchapi.SaveSeriesToJSON(seriesData, filename); err != nil {
		fmt.Printf("Failed to save JSON: %v\n", err)
	}
	return
}

func StartVizServer(jsonpath string) error {
	port := 49966
	fmt.Println(port)
	return nil
}
