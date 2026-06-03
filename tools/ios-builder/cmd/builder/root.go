package builder

import (
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "builder",
	Short: "Builder sets up GitHub Actions workflows to build iOS apps remotely.",
	Long:  "Builder sets up GitHub Actions workflows to build iOS apps remotely.\nPerfect for developers on Windows/Linux who need to build iOS IPAs.",
}

func Execute() {
	rootCmd.Execute()
}

var verbose bool

func init() {
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "Enable verbose output")
}