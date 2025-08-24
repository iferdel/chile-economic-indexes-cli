package cmd

import (
	"fmt"
	"log"
	"maps"
	"net/http"
	"slices"
	"strings"
	"time"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
	"github.com/iferdel/chile-economic-indexes-cli/internal/fileio"
	"github.com/pkg/browser"
	"github.com/spf13/cobra"
)

type OutputSetData struct {
	Description string                            `json:"description"`
	SeriesData  map[string]bcchapi.SeriesDataResp `json:"seriesData"`
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
take a look at 'search --predefined-sets'
		`,
	Example: "bcch viz",
	Run: withSpinnerWrapper(cfg.spinner, func(cmd *cobra.Command, args []string) {
		err := cfg.bcchapiClient.AuthConfig.Load()
		if err != nil {
			fmt.Printf("error loading credentials: %v\n", err)
			return
		}

		setNameFlag, _ := cmd.Flags().GetString("set")
		setName := strings.ToUpper(setNameFlag)
		portFlag, _ := cmd.Flags().GetString("port")

		// Use default set if none specified
		if setName == "" {
			setName = "EMPLOYMENT"
		}

		set, ok := AvailableSetsSeries[setName]
		if !ok {
			log.Fatalf("serie %q not present in available series: %v", setName, slices.Sorted(maps.Keys(AvailableSetsSeries)))
		}

		cfg.fetchSeries(setName, set, "./public/series.json", 3)

		// can later use go for --detached mode
		if err := StartVizServer("public", portFlag); err != nil {
			log.Fatalf("viz server error: %v", err)
		}
	}),
}

func init() {
	// can be expanded with flag such as 'detached mode'
	rootCmd.AddCommand(vizCmd)
	vizCmd.Flags().String("set", "", "Predefined set of data to viz predefined graphs (default: EMPLOYMENT)")
	vizCmd.Flags().StringP("port", "p", "49966", "Port for the visualization server")
}

// if filename is empty "", it saves it into memory?? --> redis?
func (cfg *config) fetchSeries(setName string, set Set, filename string, maxConcurrency int) {
	seriesSetData, seriesSetErrors := cfg.bcchapiClient.GetMultipleSeriesData(
		set.SeriesNames,
		"",
		"",
		&bcchapi.FetchOptions{MaxConcurrency: maxConcurrency},
	)

	for _, err := range seriesSetErrors {
		if err != nil {
			fmt.Printf("Error: %v\n", err)
		}
	}

	outputSetData := map[string]OutputSetData{
		setName: {
			Description: set.Description,
			SeriesData:  seriesSetData,
		},
	}

	if err := fileio.SaveSeriesToJSON(
		outputSetData,
		filename,
	); err != nil {
		fmt.Printf("Failed to save JSON: %v\n", err)
	}
}

func StartVizServer(publicDir, port string) error {
	fs := http.FileServer(http.Dir(publicDir))

	http.Handle("/", fs)

	url := "http://localhost:" + port + "/"
	go func() {
		time.Sleep(2 * time.Second)
		if err := browser.OpenURL(url); err != nil {
			log.Printf("Warning: Could not open browser automatically: %v", err)
		}
	}()

	log.Printf("Serving series visualization at %s -- Ctrl+C to stop", url)
	
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      nil,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	return server.ListenAndServe()
}
