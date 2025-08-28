package cmd

import (
	"encoding/json"
	"fmt"
	"log"
	"maps"
	"net/http"
	"slices"
	"strings"
	"time"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/v3/internal/bcch-api"
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
		Start a local web server with both static file serving and API endpoints for visualizing series data.

		This command launches a hybrid server that serves static files (HTML, CSS, JS)
and provides REST API endpoints for dynamic data fetching from BCCh API.
The dashboard visualizes trends of predefined sets of series with interactive charts.
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

		// can later use go for --detached mode
		if err := cfg.StartVizServer("public", portFlag); err != nil {
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

func (cfg *config) fetchSeries(setName string, set Set, maxConcurrency int) map[string]OutputSetData {
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

	return outputSetData
}

func (cfg *config) StartVizServer(publicDir, port string) error {
	const filepathRoot = "."

	url := "http://localhost:" + port + "/"
	go func() {
		time.Sleep(2 * time.Second)
		if err := browser.OpenURL(url); err != nil {
			log.Printf("Warning: Could not open browser automatically: %v", err)
		}
	}()

	log.Printf("Serving series visualization at %s -- Ctrl+C to stop", url)

	mux := http.NewServeMux()
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	mux.Handle("/", http.FileServer(http.Dir(publicDir)))
	mux.HandleFunc("GET /api/sets/{set}", cfg.handlerSetGet)

	return server.ListenAndServe()
}

func (cfg *config) handlerSetGet(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	type responseBody struct {
		Set map[string]OutputSetData
	}

	setName := strings.ToUpper(r.PathValue("set"))
	set, ok := AvailableSetsSeries[setName]
	if !ok {
		respondWithError(
			w,
			http.StatusBadRequest,
			"set not found",
			fmt.Errorf("serie %q not present in available series: %v", setName, slices.Sorted(maps.Keys(AvailableSetsSeries))),
		)
		return
	}

	setData := cfg.fetchSeries(setName, set, 3)

	respondWithJSON(w, http.StatusOK, responseBody{
		Set: setData,
	})

}

func respondWithJSON(w http.ResponseWriter, code int, payload any) error {
	response, err := json.Marshal(payload)
	if err != nil {
		return nil
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(code)
	w.Write(response)
	return nil
}

func respondWithError(w http.ResponseWriter, code int, msg string, err error) {
	if err != nil {
		log.Println(err)
	}
	if code > 499 {
		log.Printf("Responding with 5XX error: %s", msg)
	}
	type errorResponse struct {
		Error string `json:"error"`
	}
	respondWithJSON(w, code, errorResponse{
		Error: msg,
	})
}
