package cmd

import (
	"fmt"
	"time"

	"github.com/spf13/cobra"
)

const dateLayout = "2006-01-02"

var getCmd = &cobra.Command{
	Use:   "get",
	Short: "Retrieve data from specific series ID",
	Long: `
    Retrieve time series data from BCCh.

    Example:
        bcch get --series UF --firstdate 2020-01-01 --lastdate 2021-01-01
	`,
	Run: withSpinnerWrapper(cfg.spinner, func(cmd *cobra.Command, args []string) {
		err := cfg.bcchapiClient.AuthConfig.Load()
		if err != nil {
			fmt.Printf("error loading credentials: %v\n", err)
			return
		}
		creds := cfg.bcchapiClient.AuthConfig
		if creds.User == "" || creds.Password == "" {
			fmt.Println("you need to first set your BCCH credentials to use this command, see 'help' for details")
		}

		seriesFlag, _ := cmd.Flags().GetString("series")
		firstDateFlag, _ := cmd.Flags().GetString("firstdate")
		lastDateFlag, _ := cmd.Flags().GetString("lastdate")

		if firstDateFlag != "" {
			if _, err := time.Parse(dateLayout, firstDateFlag); err != nil {
				fmt.Printf("Invalid firstdate '%s': must be YYYY-MM-DD\n", firstDateFlag)
				return
			}
		}
		if lastDateFlag != "" {
			if _, err := time.Parse(dateLayout, lastDateFlag); err != nil {
				fmt.Printf("Invalid lastdate '%s': must be YYYY-MM-DD\n", lastDateFlag)
				return
			}
		}

		seriesData, _ := cfg.bcchapiClient.GetSeriesData(seriesFlag, firstDateFlag, lastDateFlag)

		fmt.Println(seriesData.Series.DescripEsp)

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
	getCmd.Flags().String("firstdate", "", "first date in YYYY-MM-DD format (optional)")
	getCmd.Flags().String("lastdate", "", "last date in YYYY-MM-DD format (optional)")
}
