// cmd/setcredentials.go
package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// BCCH does not have any login feature, but the url for api requests uses the credentials.
var setCredentialsCmd = &cobra.Command{
	Use:   "setCredentials",
	Short: "set credentials to be used to retrieve data from BCCh API",
	Long: `It saves the credentials in a local file.
    The local file is generated in the same folder where the cmd is used`,
	Run: func(cmd *cobra.Command, args []string) {
		userFlag, _ := cmd.Flags().GetString("user")
		passwordFlag, _ := cmd.Flags().GetString("password")
		cfg.bcchapiClient.AuthConfig.User = userFlag
		cfg.bcchapiClient.AuthConfig.Password = passwordFlag

		err := cfg.bcchapiClient.AuthConfig.Save()
		if err != nil {
			fmt.Printf("failed to save credentials: %v\n", err)
			return
		}
		fmt.Println("saved credentials!")
	},
}

func init() {
	rootCmd.AddCommand(setCredentialsCmd)
	setCredentialsCmd.Flags().StringP("user", "u", "", "user for for bcch")
	setCredentialsCmd.Flags().StringP("password", "p", "", "password for bcch")
	setCredentialsCmd.MarkFlagsRequiredTogether("user", "password")
}
