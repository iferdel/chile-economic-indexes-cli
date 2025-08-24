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
	bcchCacheInterval = 24 * time.Hour
)

type config struct {
	bcchapiClient *bcchapi.Client
	spinner       *spinner.Spinner
}

type Set struct {
	Description string
	SeriesNames []string
}

var AvailableSetsSeries = map[string]Set{
	"EMPLOYMENT": {
		Description: "shows the employment relation between different regions",
		SeriesNames: []string{
			"F032.IMC.IND.Z.Z.EP18.Z.Z.1.M",
			"F074.IPC.VAR.Z.Z.C.M",
			"F019.IPC.V12.10.M",
			"F019.PPB.PRE.100.D",
			"F073.TCO.PRE.Z.D",
			"F049.DES.TAS.INE.10.M",  // Tasa de desocupación, total | Ajustada estacionalmente | INE | Mensual | Porcentaje
			"F049.DES.TAS.INE9.26.M", // Tasa de desocupación, Región del Ñuble, mensual INE
			"F049.DES.TAS.INE9.12.M", // Tasa de desocupación, Región de Antofagasta, mensual INE
		},
	},
	"SANKEY": {
		Description: "shows the sankey evolution",
		SeriesNames: []string{
			"F049.DES.TAS.HIST.10.M", // Tasas de desocupación, nacional, serie histórica
			// sankey chart with x axis time (year, month) and in y axis the % of man and woman (adding both to 100%) and see its fluctuation over the years
			"F049.DES.TAS.INE.02.M", // Tasa de desocupación, hombres | Ajustada estacionalmente | INE | Mensual | Porcentaje
			"F049.DES.TAS.INE.03.M", // Tasa de desocupación, mujeres | Ajustada estacionalmente | INE | Mensual | Porcentaje
			"F049.DES.TAS.INE.10.M", // Tasa de desocupación, total | Ajustada estacionalmente | INE | Mensual | Porcentaje
			// same graph but one for INE1 and another for INE9 to understand their differences
			"F049.DES.TAS.INE1.10N.M", // Tasa de desocupación nacional mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.11N.M", // Tasa de desocupación región I mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.12N.M", // Tasa de desocupación región II mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.13N.M", // Tasa de desocupación región III mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.14N.M", // Tasa de desocupación región IV mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.15N.M", // Tasa de desocupación región V mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.16N.M", // Tasa de desocupación región VI mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.17N.M", // Tasa de desocupación región VII mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.18N.M", // Tasa de desocupación región VIII mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.19N.M", // Tasa de desocupación IX mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.20N.M", // Tasa de desocupación X mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.21N.M", // Tasa de desocupación XI mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.22N.M", // Tasa de desocupación XII mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.23N.M", // Tasa de desocupación RMS mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.24.M",  // Tasa de desocupación XIV mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE1.25.M",  // Tasa de desocupación región XV mensual INE. Nueva regionalización.
			"F049.DES.TAS.INE9.11.M",  // Tasa de desocupación, Región de Tarapacá, mensual INE
			"F049.DES.TAS.INE9.12.M",  // Tasa de desocupación, Región de Antofagasta, mensual INE
			"F049.DES.TAS.INE9.13.M",  // Tasa de desocupación, Región de Atacama, mensual INE
			"F049.DES.TAS.INE9.14.M",  // Tasa de desocupación, Región de Coquimbo, mensual INE
			"F049.DES.TAS.INE9.15.M",  // Tasa de desocupación, Región de Valparaíso, mensual INE
			"F049.DES.TAS.INE9.16.M",  // Tasa de desocupación, Región del Libertador Gral. Bernardo O'Higgins, mensual INE
			"F049.DES.TAS.INE9.17.M",  // Tasa de desocupación, Región del Maule, mensual INE
			"F049.DES.TAS.INE9.18.M",  // Tasa de desocupación, región VIII, mensual INE
			"F049.DES.TAS.INE9.18N.M", // Tasa de desocupación, Región del Biobío, mensual INE
			"F049.DES.TAS.INE9.19.M",  // Tasa de desocupación, Región de La Araucanía, mensual INE
			"F049.DES.TAS.INE9.20.M",  // Tasa de desocupación, Región de Los Lagos, mensual INE
			"F049.DES.TAS.INE9.21.M",  // Tasa de desocupación, Región de Aysén del Gral. Carlos Ibáñez del Campo, mensual INE
			"F049.DES.TAS.INE9.22.M",  // Tasa de desocupación, Región de Magallanes y Antártica Chilena, mensual INE
			"F049.DES.TAS.INE9.23.M",  // Tasa de desocupación, Región Metropolitana, mensual INE
			"F049.DES.TAS.INE9.24.M",  // Tasa de desocupación, Región de Los Ríos, mensual INE
			"F049.DES.TAS.INE9.25.M",  // Tasa de desocupación, Región de Arica y parinacota, mensual INE
			"F049.DES.TAS.INE9.26.M",  // Tasa de desocupación, Región del Ñuble, mensual INE
		},
	},
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
