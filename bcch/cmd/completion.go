package cmd

import "github.com/spf13/cobra"

var completionCmd = &cobra.Command{
	Use:       "completion [bash|zsh|fish|powershell]",
	Short:     "Generate completion script",
	Long:      "Generate shell autocompletion script to enable tab-completion for bcch commands and flags.",
	Args:      cobra.ExactArgs(1),
	ValidArgs: []string{"bash", "zsh", "fish", "powershell"},
	Run: func(cmd *cobra.Command, args []string) {
		var err error
		switch args[0] {
		case "bash":
			err = rootCmd.GenBashCompletion(cmd.OutOrStdout())
		case "zsh":
			err = rootCmd.GenZshCompletion(cmd.OutOrStdout())
		case "fish":
			err = rootCmd.GenFishCompletion(cmd.OutOrStdout(), true)
		case "powershell":
			err = rootCmd.GenPowerShellCompletionWithDesc(cmd.OutOrStdout())
		}
		if err != nil {
			cmd.PrintErrf("Error generating completion script: %v\n", err)
		}
	},
}

func init() {
	rootCmd.AddCommand(completionCmd)
}
