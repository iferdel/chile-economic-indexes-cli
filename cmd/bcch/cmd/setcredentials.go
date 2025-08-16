// cmd/setcredentials.go
package cmd

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"

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
		saveLocalCredentials(cfg, bcchCredentials) // #nosec G104
		fmt.Println("saved credentials!")
	},
}

func init() {
	rootCmd.AddCommand(setCredentialsCmd)
	setCredentialsCmd.Flags().StringP("user", "u", "", "user for for bcch")
	setCredentialsCmd.Flags().StringP("password", "p", "", "password for bcch")
	setCredentialsCmd.MarkFlagsRequiredTogether("user", "password")
}

func loadLocalCredentials(cfg *config, filename string) error {
	dat, err := os.ReadFile(filepath.Clean(filename))
	if err != nil {
		return errors.New("no credentials yet saved, 'set-credentials' saves credentials for future sessions")
	}

	err = json.Unmarshal(dat, &cfg.bcchapiClient.AuthConfig)
	if err != nil {
		return err
	}
	return nil

}

func saveLocalCredentials(cfg config, filename string) error {
	data, err := json.MarshalIndent(cfg.bcchapiClient.AuthConfig, "", "  ")
	if err != nil {
		return err
	}
	if f, err := os.Create(filepath.Clean(filename)); err == nil {
		defer f.Close()
		_, err := f.Write(data)
		if err != nil {
			return fmt.Errorf("error saving credentials before exiting CLI")
		}
	}
	return nil
}
