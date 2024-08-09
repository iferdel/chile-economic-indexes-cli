package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var getCmd = &cobra.Command{
	Use:   "get",
	Short: "Retrieve data from specific series ID",
	Run: withSpinnerWrapper(cfg.spinner, func(cmd *cobra.Command, args []string) {
		err := loadLocalCredentials(&cfg, bcchCredentials)
		if err != nil {
			fmt.Println(err)
		}
		creds := cfg.bcchapiClient.AuthConfig
		if creds.User == "" || creds.Password == "" {
			fmt.Println("you need to first set your BCCH credentials to use this command, see 'help' for details")
		}

		seriesFlag, _ := cmd.Flags().GetString("series")
		seriesData, _ := cfg.bcchapiClient.GetSeriesData(seriesFlag)

		if seriesData.Codigo != 0 {
			fmt.Println(seriesData.Descripcion)
		}
		// placeholder for spinner last symbol
		fmt.Println("")
		for _, series := range seriesData.Series.Obs {
			fmt.Printf("%v - %v\n", series.IndexDateString, series.Value)
		}
	}),
}

func init() {
	rootCmd.AddCommand(getCmd)
	getCmd.Flags().StringP("series", "s", "", "series ID")
}
