document.addEventListener('DOMContentLoaded', async () => {
    try {
        // For development, we'll use sample data since we can't directly fetch from Kaggle
        const sampleData = [
            { country: "United States", year: 2022, debt_gdp: 123.4, debt_usd: 30000000000000 },
            { country: "Japan", year: 2022, debt_gdp: 264.1, debt_usd: 12000000000000 },
            { country: "China", year: 2022, debt_gdp: 77.1, debt_usd: 15000000000000 },
            { country: "United Kingdom", year: 2022, debt_gdp: 101.9, debt_usd: 3000000000000 },
            { country: "France", year: 2022, debt_gdp: 112.9, debt_usd: 3000000000000 },
            { country: "Italy", year: 2022, debt_gdp: 150.8, debt_usd: 3000000000000 },
            { country: "Germany", year: 2022, debt_gdp: 69.3, debt_usd: 3000000000000 },
            { country: "Canada", year: 2022, debt_gdp: 106.4, debt_usd: 1500000000000 },
            { country: "Brazil", year: 2022, debt_gdp: 88.6, debt_usd: 1500000000000 },
            { country: "India", year: 2022, debt_gdp: 83.5, debt_usd: 2000000000000 }
        ];

        // Create global debt distribution chart
        createGlobalDebtChart(sampleData);
        
        // Create debt trend chart
        createDebtTrendChart(sampleData);
        
        // Update global metrics
        updateGlobalMetrics(sampleData);

        // Add data source information
        document.getElementById('data-source').innerHTML = `
            <p>Data Source: <a href="https://www.kaggle.com/datasets/sazidthe1/global-debt-data" target="_blank">Global Debt Data on Kaggle</a></p>
            <p>Note: This is sample data. To use the full dataset, download it from Kaggle and update the data in the code.</p>
        `;
    } catch (error) {
        console.error('Error loading global debt data:', error);
        document.getElementById('global-debt-container').innerHTML = 
            '<p class="error-message">Error loading global debt data. Please try again later.</p>';
    }
});

function createGlobalDebtChart(data) {
    const ctx = document.getElementById('global-debt-chart').getContext('2d');
    
    // Sort data by debt-to-GDP ratio
    const sortedData = [...data].sort((a, b) => b.debt_gdp - a.debt_gdp).slice(0, 10);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(d => d.country),
            datasets: [{
                label: 'Debt-to-GDP Ratio (%)',
                data: sortedData.map(d => d.debt_gdp),
                backgroundColor: '#1976d2',
                borderColor: '#1565c0',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Countries by Debt-to-GDP Ratio'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Debt-to-GDP Ratio (%)'
                    }
                }
            }
        }
    });
}

function createDebtTrendChart(data) {
    const ctx = document.getElementById('debt-trend-chart').getContext('2d');
    
    // Group data by year
    const yearlyData = {};
    data.forEach(d => {
        if (!yearlyData[d.year]) {
            yearlyData[d.year] = {
                totalDebt: 0,
                count: 0
            };
        }
        yearlyData[d.year].totalDebt += d.debt_gdp;
        yearlyData[d.year].count++;
    });

    const years = Object.keys(yearlyData).sort();
    const avgDebt = years.map(year => yearlyData[year].totalDebt / yearlyData[year].count);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Average Global Debt-to-GDP Ratio',
                data: avgDebt,
                borderColor: '#ffd700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Global Debt Trend Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Debt-to-GDP Ratio (%)'
                    }
                }
            }
        }
    });
}

function updateGlobalMetrics(data) {
    const totalDebt = data.reduce((sum, d) => sum + d.debt_usd, 0);
    const avgDebtGDP = data.reduce((sum, d) => sum + d.debt_gdp, 0) / data.length;
    
    document.getElementById('global-total-debt').textContent = 
        `$${(totalDebt / 1e12).toFixed(2)}T`;
    document.getElementById('global-avg-debt-gdp').textContent = 
        `${avgDebtGDP.toFixed(2)}%`;
    document.getElementById('countries-count').textContent = 
        `${data.length} countries`;
} 