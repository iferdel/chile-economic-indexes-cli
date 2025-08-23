// Main JavaScript file for Chile Economic Indicators Dashboard
let seriesData = null;

// Color scheme matching the notebook's seaborn style
const colors = {
    skyblue: '#87CEEB',
    steelblue: '#4682B4',
    red: '#DC143C',
    darkblue: '#00008B',
    lightgray: '#D3D3D3'
};

// Load and parse series data
async function loadSeriesData() {
    try {
        const response = await fetch('series.json');
        const data = await response.json();
        seriesData = data.EMPLOYMENT.seriesData;
        window.seriesData = seriesData; // Make it globally accessible for debugging
        console.log('Series data loaded successfully');
        console.log('Available series:', Object.keys(seriesData));
        return seriesData;
    } catch (error) {
        console.error('Error loading series data:', error);
        showError('Failed to load economic data. Please ensure the viz command has been run.');
        return null;
    }
}

// Helper function to parse date string (dd-MM-yyyy format) and format for display
function parseDate(dateString) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month.padStart(2, '0')}`;
}

// Helper function to extract data from series, handling NaN values
function extractSeriesData(seriesId) {
    if (!seriesData || !seriesData[seriesId]) {
        console.error(`Series ${seriesId} not found`);
        return { data: [], labels: [] };
    }
    
    const observations = seriesData[seriesId].Series.Obs;
    const result = [];
    const labels = [];
    
    observations.forEach(obs => {
        if (obs.value !== 'NaN' && obs.value !== null && obs.value !== undefined) {
            const value = parseFloat(obs.value);
            if (!isNaN(value)) {
                result.push(value);
                labels.push(parseDate(obs.indexDateString));
            }
        }
    });
    
    return { data: result, labels: labels };
}

// Helper function to align two time series datasets with different temporal ranges
function alignTemporalData(dataset1, dataset2) {
    const data1Map = new Map();
    const data2Map = new Map();
    
    // Create maps for fast lookup by date
    dataset1.labels.forEach((label, index) => {
        data1Map.set(label, dataset1.data[index]);
    });
    
    dataset2.labels.forEach((label, index) => {
        data2Map.set(label, dataset2.data[index]);
    });
    
    // Find the intersection of dates (common time period)
    const commonDates = [...data1Map.keys()].filter(date => data2Map.has(date));
    commonDates.sort(); // Ensure chronological order
    
    // Extract aligned data for the common time period
    const alignedData1 = commonDates.map(date => data1Map.get(date));
    const alignedData2 = commonDates.map(date => data2Map.get(date));
    
    console.log(`Temporal alignment: ${commonDates.length} common dates from ${commonDates[0]} to ${commonDates[commonDates.length-1]}`);
    
    return {
        labels: commonDates,
        dataset1: alignedData1,
        dataset2: alignedData2
    };
}

// Helper function to show error messages
function showError(message) {
    const containers = document.querySelectorAll('.chart-wrapper');
    containers.forEach(container => {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    });
}

// Create unemployment vs Imacec chart
function createUnemploymentChart() {
    const canvas = document.getElementById('unemploymentChart');
    if (!canvas) {
        console.error('Canvas element not found: unemploymentChart');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    // Extract data for unemployment series
    const nationalUnemployment = extractSeriesData('F049.DES.TAS.INE9.10.M');
    const antofagastaUnemployment = extractSeriesData('F049.DES.TAS.INE9.12.M');
    const nubleUnemployment = extractSeriesData('F049.DES.TAS.INE9.26.M');
    const imacecData = extractSeriesData('F032.IMC.IND.Z.Z.EP13.Z.Z.0.M');
    
    // Calculate Imacec rate (year-over-year change) like in the notebook
    const imacecRateData = [];
    const imacecLabels = [];
    for (let i = 12; i < imacecData.data.length; i++) {
        const currentValue = imacecData.data[i];
        const previousYearValue = imacecData.data[i - 12];
        if (currentValue !== null && previousYearValue !== null) {
            imacecRateData.push(parseFloat((currentValue - previousYearValue).toFixed(1)));
            imacecLabels.push(imacecData.labels[i]);
        }
    }
    
    // Use the national unemployment labels as the base (most complete dataset)
    const labels = nationalUnemployment.labels;
    
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Unemployment (%) - National',
                    data: nationalUnemployment.data,
                    borderColor: colors.skyblue,
                    backgroundColor: colors.skyblue + '40',
                    fill: true,
                    yAxisID: 'y',
                    tension: 0.1
                },
                {
                    label: 'Unemployment (%) - Antofagasta',
                    data: antofagastaUnemployment.data,
                    borderColor: colors.steelblue,
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    yAxisID: 'y',
                    tension: 0.1
                },
                {
                    label: 'Unemployment (%) - Ñuble',
                    data: nubleUnemployment.data,
                    borderColor: colors.steelblue,
                    backgroundColor: 'transparent',
                    borderDash: [2, 2],
                    yAxisID: 'y',
                    tension: 0.1
                },
                {
                    label: 'Imacec Rate (YoY change)',
                    data: imacecRateData,
                    borderColor: colors.red,
                    backgroundColor: 'transparent',
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date (Year-Month)'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Unemployment Rate (%)',
                        color: colors.steelblue
                    },
                    ticks: {
                        color: colors.steelblue
                    },
                    grid: {
                        display: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Imacec Rate (YoY %)',
                        color: colors.red
                    },
                    ticks: {
                        color: colors.red
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    };
    
    new Chart(ctx, config);
}

// Create exchange rate vs copper price chart
function createExchangeChart() {
    try {
        const canvas = document.getElementById('exchangeChart');
        if (!canvas) {
            console.error('Canvas element not found: exchangeChart');
            return;
        }
        const ctx = canvas.getContext('2d');
        
        // Extract data
        const exchangeRateData = extractSeriesData('F073.TCO.PRE.Z.D');
        const copperPriceData = extractSeriesData('F019.PPB.PRE.100.D');
        
        // Verify data extraction
        console.log(`Exchange rate data points: ${exchangeRateData.data.length}, Copper price data points: ${copperPriceData.data.length}`);
        
        // Align datasets temporally to handle different start dates
        const alignedData = alignTemporalData(exchangeRateData, copperPriceData);
        
        if (alignedData.labels.length === 0) {
            console.error('No common dates found between exchange rate and copper price data');
            document.querySelector('.chart-wrapper').innerHTML = '<div class="error-message">No overlapping data found between USD exchange rate and copper price series</div>';
            return;
        }
        
        console.log(`Exchange chart alignment: ${alignedData.labels.length} common data points from ${alignedData.labels[0]} to ${alignedData.labels[alignedData.labels.length-1]}`);
        
        const config = {
        type: 'line',
        data: {
            labels: alignedData.labels,
            datasets: [
                {
                    label: 'USD to CLP Exchange Rate',
                    data: alignedData.dataset1,
                    borderColor: colors.skyblue,
                    backgroundColor: 'transparent',
                    yAxisID: 'y',
                    tension: 0.1,
                    pointRadius: 0.5
                },
                {
                    label: 'Copper Price (USD/lb)',
                    data: alignedData.dataset2,
                    borderColor: colors.red,
                    backgroundColor: 'transparent',
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 0.5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date (Year-Month)'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'USD to CLP Exchange Rate',
                        color: colors.steelblue
                    },
                    ticks: {
                        color: colors.steelblue
                    },
                    grid: {
                        display: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Copper Price (USD/lb)',
                        color: colors.red
                    },
                    ticks: {
                        color: colors.red
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    };
    
    new Chart(ctx, config);
    console.log('Exchange rate chart created successfully');
    
    } catch (error) {
        console.error('Error creating exchange rate chart:', error);
        const wrapper = document.querySelector('#exchangeChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">Error creating exchange rate chart: ' + error.message + '</div>';
        }
    }
}

// Create CPI comparison chart
function createCPIChart() {
    const canvas = document.getElementById('cpiChart');
    if (!canvas) {
        console.error('Canvas element not found: cpiChart');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    // Extract data
    const chileIPCData = extractSeriesData('F074.IPC.VAR.Z.Z.C.M');
    const usaIPCData = extractSeriesData('F019.IPC.V12.10.M');
    
    // Use the Chile IPC labels as the base (more complete dataset)
    const labels = chileIPCData.labels;
    
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CPI Chile (Monthly Variation %)',
                    data: chileIPCData.data,
                    borderColor: colors.skyblue,
                    backgroundColor: 'transparent',
                    tension: 0.1,
                    pointRadius: 1
                },
                {
                    label: 'CPI USA (12-month Variation %)',
                    data: usaIPCData.data,
                    borderColor: colors.red,
                    backgroundColor: 'transparent',
                    tension: 0.1,
                    pointRadius: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date (Year-Month)'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Consumer Price Index (%)',
                        color: colors.steelblue
                    },
                    ticks: {
                        color: colors.steelblue
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    };
    
    new Chart(ctx, config);
}

// Initialize dashboard
async function initDashboard() {
    console.log('Initializing Chile Economic Indicators Dashboard...');
    
    // Show loading state
    const chartWrappers = document.querySelectorAll('.chart-wrapper');
    chartWrappers.forEach(wrapper => {
        wrapper.innerHTML = '<div class="loading">Loading economic data</div>';
    });
    
    // Load data
    const data = await loadSeriesData();
    if (!data) {
        return;
    }
    
    // Restore canvas elements and create charts
    setTimeout(() => {
        try {
            // Restore canvas elements
            const chartWrappers = document.querySelectorAll('.chart-wrapper');
            chartWrappers[0].innerHTML = '<canvas id="unemploymentChart"></canvas>';
            chartWrappers[1].innerHTML = '<canvas id="exchangeChart"></canvas>';
            chartWrappers[2].innerHTML = '<canvas id="cpiChart"></canvas>';
            
            // Small delay to ensure canvas elements are rendered
            setTimeout(() => {
                console.log('Creating unemployment chart...');
                createUnemploymentChart();
                
                console.log('Creating exchange rate chart...');
                createExchangeChart();
                
                console.log('Creating CPI chart...');
                createCPIChart();
                
                console.log('Dashboard initialization complete!');
            }, 50);
            
        } catch (error) {
            console.error('Error creating charts:', error);
            showError('Error creating visualizations: ' + error.message);
        }
    }, 100);
}

// Start the application
document.addEventListener('DOMContentLoaded', initDashboard);