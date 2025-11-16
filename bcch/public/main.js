// Main JavaScript file for Chile Economic Indicators Dashboard
let seriesData = null;
let currentEngine = 'chartjs'; // Default rendering engine

// ============================================================================
// Rendering Engine Toggle
// ============================================================================

/**
 * Initialize rendering engine toggle functionality
 */
function initEngineToggle() {
    const toggleButtons = document.querySelectorAll('.engine-toggle .toggle-btn');

    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const engine = e.currentTarget.dataset.engine;
            switchRenderingEngine(engine);
        });
    });
}

/**
 * Switch between Chart.js and Matplotlib rendering engines
 * @param {string} engine - 'chartjs' or 'matplotlib'
 */
function switchRenderingEngine(engine) {
    if (currentEngine === engine) return;

    currentEngine = engine;

    // Update toggle button states
    const toggleButtons = document.querySelectorAll('.engine-toggle .toggle-btn');
    toggleButtons.forEach(btn => {
        if (btn.dataset.engine === engine) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Show/hide appropriate chart wrappers with smooth transition
    const allWrappers = document.querySelectorAll('.chart-wrapper');
    allWrappers.forEach(wrapper => {
        const wrapperEngine = wrapper.dataset.engine;

        if (wrapperEngine === engine) {
            // Show with fade-in effect
            wrapper.classList.remove('hidden');
            setTimeout(() => wrapper.classList.add('visible'), 10);
        } else {
            // Hide with fade-out effect
            wrapper.classList.remove('visible');
            setTimeout(() => wrapper.classList.add('hidden'), 300);
        }
    });

    console.log(`Switched to ${engine} rendering engine`);
}

// Brand colors following design principles
const colors = {
    // Brand colors from design system
    chartPrimary: '#69B3A2',     // Primary brand color
    chartSecondary: '#251667',   // Dark accent
    chartThird: '#FED136',       // Highlight/warm accent
    chartFourth: '#d6604d',      // Additional chart color
    chartFifth: '#f4a582',       // Additional chart color
    
    // Text colors
    textPrimary: '#212529',
    textSecondary: '#666666',
    textLight: '#999999',
    
    // Background colors
    background: '#ffffff',
    backgroundLight: '#F2F2F2'
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
        const response = await fetch('/api/sets/EMPLOYMENT');
        const data = await response.json();
        seriesData = data.Set.EMPLOYMENT.seriesData;
        window.seriesData = seriesData; // Make it globally accessible for debugging
        console.log('Series data loaded successfully');
        console.log('Available series:', Object.keys(seriesData));
        
        // Calculate global start date for temporal alignment across all charts
        calculateGlobalStartDate();
        
        return seriesData;
    } catch (error) {
        console.error('Error loading series data:', error);
        showError('Failed to load economic data. Please ensure the viz command has been run.');
        return null;
    }
}

// Calculate the global start date across all series for temporal alignment
function calculateGlobalStartDate() {
    if (!seriesData) return;
    
    const allSeriesIds = Object.keys(seriesData);
    const allStartDates = [];
    
    allSeriesIds.forEach(seriesId => {
        const series = seriesData[seriesId];
        if (series && series.Series && series.Series.Obs && series.Series.Obs.length > 0) {
            // Find first valid observation
            for (let obs of series.Series.Obs) {
                if (obs.value !== 'NaN' && obs.value !== null && obs.value !== undefined) {
                    const value = parseFloat(obs.value);
                    if (!isNaN(value)) {
                        const dateStr = parseDate(obs.indexDateString);
                        allStartDates.push(new Date(dateStr + '-01')); // Convert YYYY-MM to Date
                        break;
                    }
                }
            }
        }
    });
    
    if (allStartDates.length > 0) {
        // Find the latest (most recent) starting date
        globalStartDate = new Date(Math.max(...allStartDates));
        const globalStartStr = globalStartDate.getFullYear() + '-' + 
                              String(globalStartDate.getMonth() + 1).padStart(2, '0');
        console.log(`Global temporal alignment: All charts will start from ${globalStartStr}`);
        console.log(`Found ${allStartDates.length} series with date ranges`);
    }
}

// Helper function to parse date string (dd-MM-yyyy format) and format for display
function parseDate(dateString) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month.padStart(2, '0')}`;
}

// Helper function to extract data from series, handling NaN values and applying global temporal alignment
function extractSeriesData(seriesId, applyGlobalAlignment = false) {
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
                const dateStr = parseDate(obs.indexDateString);
                
                // Apply global temporal alignment if enabled
                if (applyGlobalAlignment && globalStartDate) {
                    const obsDate = new Date(dateStr + '-01');
                    if (obsDate >= globalStartDate) {
                        result.push(value);
                        labels.push(dateStr);
                    }
                } else {
                    result.push(value);
                    labels.push(dateStr);
                }
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
    const canvas = document.getElementById('unemploymentImacecChart');
    if (!canvas) {
        console.error('Canvas element not found: unemploymentImacecChart');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    // Extract data for unemployment series
    const nationalUnemployment = extractSeriesData('F049.DES.TAS.INE.10.M');
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
    
    // Use global temporal alignment for consistent cross-chart comparison
    // All data will be filtered to start from the globalStartDate
    const nationalAligned = extractSeriesData('F049.DES.TAS.INE.10.M', true);
    const antofagastaAligned = extractSeriesData('F049.DES.TAS.INE9.12.M', true);
    const nubleAligned = extractSeriesData('F049.DES.TAS.INE9.26.M', true);
    
    // Apply global alignment to calculated Imacec rate data
    let imacecAlignedData = [];
    let imacecAlignedLabels = [];
    if (globalStartDate) {
        for (let i = 0; i < imacecRateData.length; i++) {
            const dateStr = imacecLabels[i];
            const obsDate = new Date(dateStr + '-01');
            if (obsDate >= globalStartDate) {
                imacecAlignedData.push(imacecRateData[i]);
                imacecAlignedLabels.push(dateStr);
            }
        }
    } else {
        imacecAlignedData = imacecRateData;
        imacecAlignedLabels = imacecLabels;
    }
    
    // Create aligned data structure for consistency
    const alignedData = {
        labels: nationalAligned.labels, // They should all have the same temporal range now
        alignedData: [
            nationalAligned.data,
            antofagastaAligned.data,
            nubleAligned.data
        ]
    };
    
    if (alignedData.labels.length === 0) {
        console.error('No common dates found across unemployment and Imacec datasets');
        const wrapper = document.querySelector('#unemploymentImacecChart').closest('.chart-wrapper');
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
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: colors.chartPrimary,
                    pointBorderColor: colors.chartPrimary,
                    pointBorderWidth: 1.5,
                    tension: 0
                },
                {
                    label: 'Antofagasta Region (%)',
                    data: alignedData.alignedData[1],
                    borderColor: colors.chartSecondary,
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: colors.chartSecondary,
                    pointBorderColor: colors.chartSecondary,
                    pointBorderWidth: 1.5,
                    tension: 0
                },
                {
                    label: 'Ñuble Region (%)',
                    data: alignedData.alignedData[2],
                    borderColor: colors.chartThird,
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: colors.chartThird,
                    pointBorderColor: colors.chartThird,
                    pointBorderWidth: 1.5,
                    tension: 0
                },
                // Adding Imacec on second Y-axis (notebook style)
                {
                    label: 'Imacec Rate (YoY Change)',
                    data: imacecAlignedData,
                    borderColor: colors.chartFourth,
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: colors.chartFourth,
                    pointBorderColor: colors.chartFourth,
                    pointBorderWidth: 2,
                    tension: 0,
                    yAxisID: 'y1'  // Second Y-axis
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
                        text: 'Date (Year-Month)',
                        color: colors.textSecondary,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: colors.textSecondary,
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
                        color: colors.textSecondary,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: colors.textSecondary,
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
                },
                // Adding second Y-axis for Imacec (notebook style)
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Imacec Rate (YoY %)',
                        color: colors.chartFourth,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: colors.textSecondary,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(214, 96, 77, 0.1)'
                    },
                    border: {
                        display: false
                    }
                }
            }
        }
    };
    
    new Chart(ctx, config);

    console.log('Unemployment chart created successfully');
    
    // Create separate Imacec chart to follow data-to-viz best practices (avoid dual Y-axis)
    const imacecAlignedDataset = {
        data: imacecAlignedData,
        labels: imacecAlignedLabels
    };
    createImacecChart(imacecAlignedDataset);
    
    } catch (error) {
        console.error('Error creating unemployment + Imacec chart:', error);
        const wrapper = document.querySelector('#unemploymentImacecChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">Error creating unemployment + Imacec chart: ' + error.message + '</div>';
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
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: colors.chartFourth,
                    pointBorderColor: colors.chartFourth,
                    pointBorderWidth: 1.5,
                    tension: 0
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date (Year-Month)',
                            color: colors.textSecondary,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.textSecondary,
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
                            color: colors.textSecondary,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.textSecondary,
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

// Create exchange rate + copper chart (notebook style with dual Y-axis)
function createExchangeCopperChart() {
    try {
        const canvas = document.getElementById('exchangeCopperChart');
        if (!canvas) {
            console.error('Canvas element not found: exchangeCopperChart');
            return;
        }
        const ctx = canvas.getContext('2d');
        
        // Extract data with global temporal alignment
        const exchangeRateData = extractSeriesData('F073.TCO.PRE.Z.D', true);
        const copperPriceData = extractSeriesData('F019.PPB.PRE.100.D', true);
        
        // Verify data extraction
        console.log(`Exchange rate data points: ${exchangeRateData.data.length}, Copper price data points: ${copperPriceData.data.length}`);
        
        // Align datasets temporally within the globally aligned timeframe
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
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: colors.chartPrimary,
                    pointBorderColor: colors.chartPrimary,
                    pointBorderWidth: 1.5,
                    tension: 0
                },
                {
                    label: 'Copper Price (USD/lb)',
                    data: alignedData.dataset2,
                    borderColor: colors.chartSecondary,
                    backgroundColor: 'transparent',
                    yAxisID: 'y1',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: colors.chartSecondary,
                    pointBorderColor: colors.chartSecondary,
                    pointBorderWidth: 1.5,
                    tension: 0
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
                        color: colors.textSecondary,
                        font: {
                            size: 13,
                            weight: '600',
                            family: chartDefaults.plugins.legend.labels.font.family
                        }
                    },
                    ticks: {
                        color: colors.textSecondary,
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
                        color: colors.textSecondary,
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
                        color: colors.chartSecondary,
                        font: {
                            size: 13,
                            weight: '600',
                            family: chartDefaults.plugins.legend.labels.font.family
                        }
                    },
                    ticks: {
                        color: colors.textSecondary,
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
    console.log('Exchange rate + copper chart created successfully (notebook style)');
    
    } catch (error) {
        console.error('Error creating exchange rate chart:', error);
        const wrapper = document.querySelector('#exchangeCopperChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">Error creating exchange + copper chart: ' + error.message + '</div>';
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
    
    // Extract data with global temporal alignment
    const chileIPCData = extractSeriesData('F074.IPC.VAR.Z.Z.C.M', true);
    const usaIPCData = extractSeriesData('F019.IPC.V12.10.M', true);
    
    // Verify data extraction
    console.log(`Chile IPC data points: ${chileIPCData.data.length}`);
    console.log(`USA IPC data points: ${usaIPCData.data.length}`);
    
    // Align datasets temporally within the globally aligned timeframe
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
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: colors.chartPrimary,
                    pointBorderColor: colors.chartPrimary,
                    pointBorderWidth: 1.5,
                    tension: 0
                },
                {
                    label: 'CPI USA (12-month Variation %)',
                    data: alignedData.dataset2,
                    borderColor: colors.chartSecondary,
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: colors.chartSecondary,
                    pointBorderColor: colors.chartSecondary,
                    pointBorderWidth: 1.5,
                    tension: 0
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
                        color: colors.textSecondary,
                        font: {
                            size: 13,
                            weight: '600',
                            family: chartDefaults.plugins.legend.labels.font.family
                        }
                    },
                    ticks: {
                        color: colors.textSecondary,
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
                        color: colors.textSecondary,
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

// Create unemployment + Imacec chart (notebook style with dual Y-axis)
function createUnemploymentImacecChart() {
    try {
        const canvas = document.getElementById('unemploymentImacecChart');
        if (!canvas) {
            console.error('Canvas element not found: unemploymentImacecChart');
            return;
        }
        const ctx = canvas.getContext('2d');
        
        // Extract data for unemployment series
        const nationalUnemployment = extractSeriesData('F049.DES.TAS.INE.10.M');
        const antofagastaUnemployment = extractSeriesData('F049.DES.TAS.INE9.12.M');
        const nubleUnemployment = extractSeriesData('F049.DES.TAS.INE9.26.M');
        const imacecData = extractSeriesData('F032.IMC.IND.Z.Z.EP18.Z.Z.1.M');
        
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
        
        // Use global temporal alignment
        const nationalAligned = extractSeriesData('F049.DES.TAS.INE.10.M', true);
        const antofagastaAligned = extractSeriesData('F049.DES.TAS.INE9.12.M', true);
        const nubleAligned = extractSeriesData('F049.DES.TAS.INE9.26.M', true);
        
        // Apply global alignment to calculated Imacec rate data
        let imacecAlignedData = [];
        let imacecAlignedLabels = [];
        if (globalStartDate) {
            for (let i = 0; i < imacecRateData.length; i++) {
                const dateStr = imacecLabels[i];
                const obsDate = new Date(dateStr + '-01');
                if (obsDate >= globalStartDate) {
                    imacecAlignedData.push(imacecRateData[i]);
                    imacecAlignedLabels.push(dateStr);
                }
            }
        } else {
            imacecAlignedData = imacecRateData;
            imacecAlignedLabels = imacecLabels;
        }
        
        const config = {
            type: 'line',
            data: {
                labels: nationalAligned.labels,
                datasets: [
                    {
                        label: 'National Unemployment Rate (%)',
                        data: nationalAligned.data,
                        borderColor: colors.chartPrimary,
                        backgroundColor: colors.chartPrimary + '40', // 25% opacity
                        fill: true,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointBackgroundColor: colors.chartPrimary,
                        pointBorderColor: colors.chartPrimary,
                        pointBorderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Antofagasta Region (%)',
                        data: antofagastaAligned.data,
                        borderColor: colors.chartSecondary + 'BB', // 73% opacity
                        backgroundColor: 'transparent',
                        fill: false,
                        borderWidth: 1.5,
                        borderDash: [8, 4], // Longer, more elegant dashes
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointBackgroundColor: colors.chartSecondary,
                        pointBorderColor: colors.chartSecondary,
                        pointBorderWidth: 1.5,
                        tension: 0.1
                    },
                    {
                        label: 'Ñuble Region (%)',
                        data: nubleAligned.data,
                        borderColor: colors.chartThird + 'BB', // 73% opacity
                        backgroundColor: 'transparent',
                        fill: false,
                        borderWidth: 1.5,
                        borderDash: [2, 2], // Subtle dotted pattern
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointBackgroundColor: colors.chartThird,
                        pointBorderColor: colors.chartThird,
                        pointBorderWidth: 1.5,
                        tension: 0.1
                    },
                    {
                        label: 'Imacec Rate (YoY Change)',
                        data: imacecAlignedData,
                        borderColor: '#d32f2f', // Strong red color
                        backgroundColor: 'transparent',
                        fill: false,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointBackgroundColor: '#d32f2f',
                        pointBorderColor: '#d32f2f',
                        pointBorderWidth: 2,
                        tension: 0,
                        yAxisID: 'y1'
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
                            text: 'Date (Year-Month)',
                            color: colors.textSecondary,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.textSecondary,
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 12
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
                            text: 'Unemployment Rate (%)',
                            color: colors.textSecondary,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.textSecondary,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(105, 179, 162, 0.1)',
                            drawBorder: false
                        },
                        border: {
                            display: false
                        },
                        beginAtZero: false
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Imacec Rate (YoY %)',
                            color: colors.chartFourth,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.textSecondary,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(214, 96, 77, 0.1)'
                        },
                        border: {
                            display: false
                        }
                    }
                }
            }
        };
        
        new Chart(ctx, config);
        console.log('Unemployment + Imacec chart created successfully (notebook style)');
        
    } catch (error) {
        console.error('Error creating unemployment + Imacec chart:', error);
        const wrapper = document.querySelector('#unemploymentImacecChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">Error creating unemployment + Imacec chart: ' + error.message + '</div>';
        }
    }
}

// Create CPI comparison chart (notebook style - Chile vs USA)
function createCPIComparisonChart() {
    try {
        const canvas = document.getElementById('cpiComparisonChart');
        if (!canvas) {
            console.error('Canvas element not found: cpiComparisonChart');
            return;
        }
        const ctx = canvas.getContext('2d');
        
        // Extract data with global temporal alignment
        const chileIPCData = extractSeriesData('F074.IPC.VAR.Z.Z.C.M', true);
        const usaIPCData = extractSeriesData('F019.IPC.V12.10.M', true);
        
        // Verify data extraction
        console.log(`Chile IPC data points: ${chileIPCData.data.length}`);
        console.log(`USA IPC data points: ${usaIPCData.data.length}`);
        
        // Align datasets temporally
        const alignedData = alignTemporalDataLegacy(chileIPCData, usaIPCData);
        
        if (alignedData.labels.length === 0) {
            console.error('No common dates found between Chile and USA IPC data');
            const wrapper = document.querySelector('#cpiComparisonChart').closest('.chart-wrapper');
            if (wrapper) {
                wrapper.innerHTML = '<div class="error-message">No overlapping data found between Chile and USA IPC series</div>';
            }
            return;
        }
        
        console.log(`CPI comparison chart alignment: ${alignedData.labels.length} common data points from ${alignedData.labels[0]} to ${alignedData.labels[alignedData.labels.length-1]}`);
        
        const config = {
            type: 'line',
            data: {
                labels: alignedData.labels,
                datasets: [
                    {
                        label: 'IPC Chile (Monthly Variation %)',
                        data: alignedData.dataset1,
                        borderColor: colors.chartPrimary,
                        backgroundColor: 'transparent',
                        fill: false,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointBackgroundColor: colors.chartPrimary,
                        pointBorderColor: colors.chartPrimary,
                        pointBorderWidth: 2,
                        tension: 0
                    },
                    {
                        label: 'IPC USA (12-month Variation %)',
                        data: alignedData.dataset2,
                        borderColor: colors.chartFourth,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointBackgroundColor: colors.chartFourth,
                        pointBorderColor: colors.chartFourth,
                        pointBorderWidth: 2,
                        tension: 0
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
                            text: 'Date (Year-Month)',
                            color: colors.textSecondary,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.textSecondary,
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 15
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
                            color: colors.textSecondary,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: colors.textSecondary,
                            font: {
                                size: 11
                            }
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
        console.log('CPI comparison chart created successfully (notebook style)');
        
    } catch (error) {
        console.error('Error creating CPI comparison chart:', error);
        const wrapper = document.querySelector('#cpiComparisonChart').closest('.chart-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div class="error-message">Error creating CPI comparison chart: ' + error.message + '</div>';
        }
    }
}

// Initialize dashboard
async function initDashboard() {
    console.log('Initializing Chile Economic Indicators Dashboard...');

    // Initialize rendering engine toggle
    initEngineToggle();

    // Show loading state with spinner (only on Chart.js wrappers)
    const chartWrappers = document.querySelectorAll('.chart-wrapper[data-engine="chartjs"]');
    chartWrappers.forEach(wrapper => {
        wrapper.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Loading economic data from BCCh API...</div>';
    });

    // Load data
    const data = await loadSeriesData();
    if (!data) {
        return;
    }
    
    // Restore canvas elements and create charts - Only 3 charts now
    setTimeout(() => {
        try {
            // Restore canvas elements for 3 Chart.js charts
            const chartWrappers = document.querySelectorAll('.chart-wrapper[data-engine="chartjs"]');
            chartWrappers[0].innerHTML = '<canvas id="unemploymentImacecChart"></canvas>';
            chartWrappers[1].innerHTML = '<canvas id="exchangeCopperChart"></canvas>';
            chartWrappers[2].innerHTML = '<canvas id="cpiComparisonChart"></canvas>';
            
            // Small delay to ensure canvas elements are rendered
            setTimeout(() => {
                console.log('Creating unemployment + Imacec chart (notebook style)...');
                createUnemploymentImacecChart();
                
                console.log('Creating exchange rate + copper chart (notebook style)...');
                createExchangeCopperChart();
                
                console.log('Creating CPI comparison chart (notebook style)...');
                createCPIComparisonChart();
                
                console.log('Notebook-style dashboard initialization complete!');
            }, 50);
            
        } catch (error) {
            console.error('Error creating charts:', error);
            showError('Error creating visualizations: ' + error.message);
        }
    }, 100);
}

// Start the application
document.addEventListener('DOMContentLoaded', initDashboard);
