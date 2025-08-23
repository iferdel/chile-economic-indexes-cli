// Main JavaScript file for Chile Economic Indicators Dashboard
let seriesData = null;

// Clean, minimal color scheme following data-to-viz.com principles
const colors = {
    // Simple, professional chart colors
    chartPrimary: '#2166ac',
    chartSecondary: '#762a83',
    chartThird: '#5aae61',
    chartFourth: '#d6604d',
    chartFifth: '#f4a582',
    
    // Text colors
    textPrimary: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',
    
    // Background colors
    background: '#ffffff',
    backgroundLight: '#fafafa'
};

// Minimal chart configuration following data-to-viz.com principles
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            align: 'center',
            labels: {
                usePointStyle: false,
                padding: 20,
                font: {
                    size: 13,
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                },
                color: colors.textPrimary,
                boxWidth: 15,
                boxHeight: 2
            }
        },
        tooltip: {
            backgroundColor: colors.background,
            titleColor: colors.textPrimary,
            bodyColor: colors.textSecondary,
            borderColor: '#e0e0e0',
            borderWidth: 1,
            cornerRadius: 4,
            displayColors: true,
            mode: 'index',
            intersect: false,
            padding: 12,
            titleFont: {
                size: 13,
                weight: '600'
            },
            bodyFont: {
                size: 12
            },
            callbacks: {
                label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y;
                    const unit = label.includes('%') ? '%' : 
                                label.includes('Rate') ? '' : 
                                label.includes('CLP') ? ' CLP' :
                                label.includes('USD') ? ' USD' : '';
                    return `${label}: ${Number(value).toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    })}${unit}`;
                }
            }
        }
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 4,
            hoverBorderWidth: 2,
            backgroundColor: colors.background,
            borderWidth: 2
        },
        line: {
            tension: 0
        }
    },
    animation: {
        duration: 0
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: colors.textSecondary,
                font: {
                    size: 11
                }
            }
        },
        y: {
            grid: {
                color: '#f0f0f0',
                lineWidth: 1
            },
            ticks: {
                color: colors.textSecondary,
                font: {
                    size: 11
                }
            }
        }
    }
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

// Helper function to align multiple time series datasets with different temporal ranges
function alignTemporalData(...datasets) {
    if (datasets.length < 2) {
        throw new Error('alignTemporalData requires at least 2 datasets');
    }
    
    // Create maps for fast lookup by date for each dataset
    const dataMaps = datasets.map(dataset => {
        const map = new Map();
        dataset.labels.forEach((label, index) => {
            map.set(label, dataset.data[index]);
        });
        return map;
    });
    
    // Find the intersection of dates across all datasets
    let commonDates = [...dataMaps[0].keys()];
    for (let i = 1; i < dataMaps.length; i++) {
        commonDates = commonDates.filter(date => dataMaps[i].has(date));
    }
    
    commonDates.sort(); // Ensure chronological order
    
    if (commonDates.length === 0) {
        console.warn('No common dates found across all datasets');
        return {
            labels: [],
            alignedData: datasets.map(() => [])
        };
    }
    
    // Extract aligned data for the common time period
    const alignedData = dataMaps.map(map => 
        commonDates.map(date => map.get(date))
    );
    
    console.log(`Temporal alignment: ${commonDates.length} common dates from ${commonDates[0]} to ${commonDates[commonDates.length-1]} across ${datasets.length} datasets`);
    
    return {
        labels: commonDates,
        alignedData: alignedData
    };
}

// Legacy function for backward compatibility (2 datasets only)
function alignTemporalDataLegacy(dataset1, dataset2) {
    const result = alignTemporalData(dataset1, dataset2);
    return {
        labels: result.labels,
        dataset1: result.alignedData[0],
        dataset2: result.alignedData[1]
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
    try {
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
    const imacecData = extractSeriesData('F032.IMC.IND.Z.Z.EP18.Z.Z.1.M');
    
    // Verify data extraction
    console.log(`National unemployment data points: ${nationalUnemployment.data.length}`);
    console.log(`Antofagasta unemployment data points: ${antofagastaUnemployment.data.length}`);
    console.log(`Ñuble unemployment data points: ${nubleUnemployment.data.length}`);
    console.log(`Imacec data points: ${imacecData.data.length}`);
    
    // Calculate Imacec rate (year-over-year change) like in the notebook
    const imacecRateData = [];
    const imacecLabels = [];
    for (let i = 12; i < imacecData.data.length; i++) {
        const currentValue = imacecData.data[i];
        const previousYearValue = imacecData.data[i - 12];
        if (currentValue !== null && previousYearValue !== null && !isNaN(currentValue) && !isNaN(previousYearValue)) {
            imacecRateData.push(parseFloat((currentValue - previousYearValue).toFixed(1)));
            imacecLabels.push(imacecData.labels[i]);
        }
    }
    
    // Create processed Imacec dataset for temporal alignment
    const imacecRateDataset = {
        data: imacecRateData,
        labels: imacecLabels
    };
    
    console.log(`Imacec rate calculated points: ${imacecRateData.length}`);
    
    // Align all datasets temporally
    const alignedData = alignTemporalData(
        nationalUnemployment,
        antofagastaUnemployment, 
        nubleUnemployment,
        imacecRateDataset
    );
    
    if (alignedData.labels.length === 0) {
        console.error('No common dates found across unemployment and Imacec datasets');
        const wrapper = document.querySelector('#unemploymentChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">No overlapping data found between unemployment and Imacec series</div>';
        }
        return;
    }
    
    console.log(`Unemployment chart alignment: ${alignedData.labels.length} common data points from ${alignedData.labels[0]} to ${alignedData.labels[alignedData.labels.length-1]}`);
    
    // Use the temporally aligned labels
    const labels = alignedData.labels;
    
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'National Unemployment Rate (%)',
                    data: alignedData.alignedData[0],
                    borderColor: colors.chartPrimary,
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: colors.chartPrimary,
                    pointBorderColor: colors.background,
                    pointBorderWidth: 2,
                    tension: 0
                },
                {
                    label: 'Antofagasta Region (%)',
                    data: alignedData.alignedData[1],
                    borderColor: colors.chartSecondary,
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: colors.chartSecondary,
                    pointBorderColor: colors.background,
                    pointBorderWidth: 2,
                    tension: 0
                },
                {
                    label: 'Ñuble Region (%)',
                    data: alignedData.alignedData[2],
                    borderColor: colors.chartThird,
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: colors.chartThird,
                    pointBorderColor: colors.background,
                    pointBorderWidth: 2,
                    tension: 0
                }
                // Removed Imacec from this chart to avoid dual Y-axis issue
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
                        text: 'Date (Year-Month)',
                        color: colors.darkNeutral,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: colors.darkNeutral,
                        font: {
                            size: 10
                        },
                        maxTicksLimit: 12
                    },
                    grid: {
                        display: true,
                        color: 'rgba(33, 37, 41, 0.05)',
                        drawBorder: false
                    },
                    border: {
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
                        color: colors.darkNeutral,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: colors.darkNeutral,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(105, 179, 162, 0.08)',
                        drawBorder: false
                    },
                    border: {
                        display: false
                    },
                    // Following data-to-viz: unemployment rates don't need to start at 0
                    beginAtZero: false
                }
                // Removed dual Y-axis as per data-to-viz.com recommendation against dual axes
            }
        }
    };
    
    new Chart(ctx, config);

    console.log('Unemployment chart created successfully');
    
    // Create separate Imacec chart to follow data-to-viz best practices (avoid dual Y-axis)
    createImacecChart(imacecRateDataset);
    
    } catch (error) {
        console.error('Error creating unemployment chart:', error);
        const wrapper = document.querySelector('#unemploymentChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">Error creating unemployment chart: ' + error.message + '</div>';
        }
    }
}

// Create separate Imacec chart following data-to-viz best practices
function createImacecChart(imacecData) {
    try {
        const canvas = document.getElementById('imacecChart');
        if (!canvas) {
            console.error('Canvas element not found: imacecChart');
            return;
        }
        const ctx = canvas.getContext('2d');
        
        const config = {
            type: 'line',
            data: {
                labels: imacecData.labels,
                datasets: [{
                    label: 'Monthly Index of Economic Activity (Imacec) - YoY Change (%)',
                    data: imacecData.data,
                    borderColor: colors.chartFourth,
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: colors.chartDanger,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.1
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date (Year-Month)',
                            color: colors.darkNeutral,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.darkNeutral,
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 12
                        },
                        grid: {
                            display: true,
                            color: 'rgba(33, 37, 41, 0.05)',
                            drawBorder: false
                        },
                        border: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Year-over-Year Change (%)',
                            color: colors.darkNeutral,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.darkNeutral,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(225, 87, 89, 0.08)',
                            drawBorder: false
                        },
                        border: {
                            display: false
                        },
                        // Add zero line for economic indicator reference
                        beginAtZero: true
                    }
                }
            }
        };
        
        new Chart(ctx, config);
        console.log('Imacec chart created successfully');
        
    } catch (error) {
        console.error('Error creating Imacec chart:', error);
    }
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
        const alignedData = alignTemporalDataLegacy(exchangeRateData, copperPriceData);
        
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
                    borderColor: colors.chartPrimary,
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: colors.chartPrimary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Copper Price (USD/lb)',
                    data: alignedData.dataset2,
                    borderColor: colors.chartDanger,
                    backgroundColor: 'transparent',
                    yAxisID: 'y1',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: colors.chartDanger,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date (Year-Month)',
                        color: colors.darkNeutral,
                        font: {
                            size: 13,
                            weight: '600',
                            family: chartDefaults.plugins.legend.labels.font.family
                        }
                    },
                    ticks: {
                        color: colors.darkNeutral,
                        font: {
                            size: 10,
                            weight: '500'
                        },
                        maxTicksLimit: 12,
                        padding: 8
                    },
                    grid: {
                        display: true,
                        color: 'rgba(33, 37, 41, 0.08)',
                        drawBorder: false
                    },
                    border: {
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
                        color: colors.chartPrimary,
                        font: {
                            size: 13,
                            weight: '600',
                            family: chartDefaults.plugins.legend.labels.font.family
                        }
                    },
                    ticks: {
                        color: colors.darkNeutral,
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        padding: 8
                    },
                    grid: {
                        display: true,
                        color: 'rgba(105, 179, 162, 0.1)',
                        drawBorder: false
                    },
                    border: {
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
                        color: colors.chartDanger,
                        font: {
                            size: 13,
                            weight: '600',
                            family: chartDefaults.plugins.legend.labels.font.family
                        }
                    },
                    ticks: {
                        color: colors.darkNeutral,
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        padding: 8
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(225, 87, 89, 0.1)'
                    },
                    border: {
                        display: false
                    }
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
    try {
    const canvas = document.getElementById('cpiChart');
    if (!canvas) {
        console.error('Canvas element not found: cpiChart');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    // Extract data
    const chileIPCData = extractSeriesData('F074.IPC.VAR.Z.Z.C.M');
    const usaIPCData = extractSeriesData('F019.IPC.V12.10.M');
    
    // Verify data extraction
    console.log(`Chile IPC data points: ${chileIPCData.data.length}`);
    console.log(`USA IPC data points: ${usaIPCData.data.length}`);
    
    // Align datasets temporally to handle different start dates
    const alignedData = alignTemporalDataLegacy(chileIPCData, usaIPCData);
    
    if (alignedData.labels.length === 0) {
        console.error('No common dates found between Chile and USA IPC data');
        const wrapper = document.querySelector('#cpiChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">No overlapping data found between Chile and USA IPC series</div>';
        }
        return;
    }
    
    console.log(`CPI chart alignment: ${alignedData.labels.length} common data points from ${alignedData.labels[0]} to ${alignedData.labels[alignedData.labels.length-1]}`);
    
    const labels = alignedData.labels;
    
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CPI Chile (Monthly Variation %)',
                    data: alignedData.dataset1,
                    borderColor: colors.chartPrimary,
                    backgroundColor: colors.chartPrimary + '15',
                    fill: true,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: colors.chartPrimary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'CPI USA (12-month Variation %)',
                    data: alignedData.dataset2,
                    borderColor: colors.chartDanger,
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: colors.chartDanger,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date (Year-Month)',
                        color: colors.darkNeutral,
                        font: {
                            size: 13,
                            weight: '600',
                            family: chartDefaults.plugins.legend.labels.font.family
                        }
                    },
                    ticks: {
                        color: colors.darkNeutral,
                        font: {
                            size: 10,
                            weight: '500'
                        },
                        maxTicksLimit: 15,
                        padding: 8
                    },
                    grid: {
                        display: true,
                        color: 'rgba(33, 37, 41, 0.08)',
                        drawBorder: false
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Consumer Price Index (%)',
                        color: colors.chartPrimary,
                        font: {
                            size: 13,
                            weight: '600',
                            family: chartDefaults.plugins.legend.labels.font.family
                        }
                    },
                    ticks: {
                        color: colors.darkNeutral,
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        padding: 8
                    },
                    grid: {
                        display: true,
                        color: 'rgba(105, 179, 162, 0.1)',
                        drawBorder: false
                    },
                    border: {
                        display: false
                    }
                }
            }
        }
    };
    
    new Chart(ctx, config);

    console.log('CPI chart created successfully');
    
    } catch (error) {
        console.error('Error creating CPI chart:', error);
        const wrapper = document.querySelector('#cpiChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">Error creating CPI chart: ' + error.message + '</div>';
        }
    }
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
            chartWrappers[1].innerHTML = '<canvas id="imacecChart"></canvas>';
            chartWrappers[2].innerHTML = '<canvas id="exchangeChart"></canvas>';
            chartWrappers[3].innerHTML = '<canvas id="cpiChart"></canvas>';
            
            // Small delay to ensure canvas elements are rendered
            setTimeout(() => {
                console.log('Creating unemployment chart...');
                createUnemploymentChart();
                
                // Note: Imacec chart is created from within createUnemploymentChart()
                
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
