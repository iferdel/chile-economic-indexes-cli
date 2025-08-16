package cmd

import (
	"time"

	bcchapi "github.com/iferdel/chile-economic-indexes-cli/internal/bcch-api"
	"github.com/iferdel/chile-economic-indexes-cli/internal/spinner"
	"github.com/spf13/cobra"
)

var (
	cfg config
)

const (
	clientTimeout     = time.Minute
	bcchCredentials   = ".bcch_credentials" // #nosec G101
	bcchCacheInterval = 24 * time.Hour
)

type config struct {
	bcchapiClient bcchapi.Client
	spinner       *spinner.Spinner
}

var rootCmd = &cobra.Command{
	Use:   "bcch",
	Short: "CLI Tool for Interacting with the Banco Central de Chile (BCCh) API",
	Long: `This CLI tool allows you to set credentials and search for available data series from the Banco Central de Chile API. 
It allows the use of keywords to filter the whole list of available data series. 
Every data series has their own ID which may be used on get command to retrieve its data.`,
}

// Execute executes the root command.
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	cobra.OnInitialize(initConfig)
}

func initConfig() {
	cfg.bcchapiClient = bcchapi.NewClient(clientTimeout, bcchCacheInterval)
}

func withSpinnerWrapper(s *spinner.Spinner, fn func(cmd *cobra.Command, args []string)) func(cmd *cobra.Command, args []string) {
	s = spinner.New(spinner.Config{})
	return func(cmd *cobra.Command, args []string) {
		s.Start()
		defer s.Stop()
		fn(cmd, args)
	}
}
