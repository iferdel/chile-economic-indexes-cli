package cmd

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
	"github.com/iferdel/chile-economic-indexes-cli/internal/fileio"
	"github.com/pkg/browser"
	"github.com/spf13/cobra"
)

type Set struct {
	Description string
	Series      []string
}

type OutputSetData struct {
	Description string      `json:"description"`
	SeriesData  interface{} `json:"seriesData"` // The actual fetched series data (slice of bcchapi.SeriesData)
}

var vizCmd = &cobra.Command{
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
	Example: "bcch viz",
	//Example: "bcch viz UN --detached",
	Run: withSpinnerWrapper(cfg.spinner, func(cmd *cobra.Command, args []string) {
		err := cfg.bcchapiClient.AuthConfig.Load()
		if err != nil {
			fmt.Printf("error loading credentials: %v\n", err)
			return
		}

		setNameFlag, _ := cmd.Flags().GetString("set")
		setName := strings.ToUpper(setNameFlag)

		availableSetsSeries := map[string]Set{
			"EMPLOYMENT": {
				Description: "shows the employment relation between different regions",
				Series: []string{
					"F032.IMC.IND.Z.Z.EP13.Z.Z.0.M",
					"F074.IPC.VAR.Z.Z.C.M",
					"F019.IPC.V12.10.M",
					"F019.PPB.PRE.100.D",
					"F073.TCO.PRE.Z.D",
					"F049.DES.TAS.INE9.10.M",
					"F049.DES.TAS.INE9.26.M",
					"F049.DES.TAS.INE9.12.M",
				},
			},
		}

		availableSets := make([]string, 0, len(availableSetsSeries))
		for k := range availableSetsSeries {
			availableSets = append(availableSets, k)
		}

		set, ok := availableSetsSeries[setName]
		if !ok {
			log.Fatalf("serie %v not present in available series: %v", setName, availableSets)
		}

		cfg.fetchSeries(setName, set, "./public/series.json", 3)

		// can later use go for --detached mode
		if err := StartVizServer("public", "49966"); err != nil {
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
	vizCmd.Flags().String("set", "", "Predefined set of data to viz predefined graphs")
}

// if filename is empty "", it saves it into memory?? --> redis?
func (cfg *config) fetchSeries(setName string, set Set, filename string, MaxConcurrency int) {
	seriesSetData, seriesSetErrors := cfg.bcchapiClient.GetMultipleSeriesData(
		set.Series,
		"",
		"",
		&bcchapi.FetchOptions{MaxConcurrency: MaxConcurrency},
	)

	for _, err := range seriesSetErrors {
		if err != nil {
			fmt.Printf("Error: %v\n", err)
		}
	}

	outputDataForSet := OutputSetData{
		Description: set.Description,
		SeriesData:  seriesSetData, // This will be marshaled as an array in JSON
	}

	finalJSONOutput := map[string]OutputSetData{
		setName: outputDataForSet,
	}

	if err := fileio.SaveSeriesToJSON(
		finalJSONOutput,
		filename,
	); err != nil {
		fmt.Printf("Failed to save JSON: %v\n", err)
	}
	return
}

func StartVizServer(publicDir, port string) error {
	fs := http.FileServer(http.Dir(publicDir))

	http.Handle("/", fs)

	url := "http://localhost:" + port + "/"
	go func() {
		time.Sleep(2 * time.Second)
		browser.OpenURL(url)
	}()

	log.Printf("Serving series visualization at %s -- Ctrl+C to stop", url)
	return http.ListenAndServe(":"+port, nil)
}
