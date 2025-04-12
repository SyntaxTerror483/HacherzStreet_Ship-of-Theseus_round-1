// Sample data from Kaggle dataset (replace with actual data when available)
const debtData = {
    countries: [
        { name: "United States", debt_gdp: 123.4, debt_usd: 30000000000000 },
        { name: "Japan", debt_gdp: 264.1, debt_usd: 12000000000000 },
        { name: "China", debt_gdp: 77.1, debt_usd: 15000000000000 },
        { name: "United Kingdom", debt_gdp: 101.9, debt_usd: 3000000000000 },
        { name: "France", debt_gdp: 112.9, debt_usd: 3000000000000 },
        { name: "Italy", debt_gdp: 150.8, debt_usd: 3000000000000 },
        { name: "Germany", debt_gdp: 69.3, debt_usd: 3000000000000 },
        { name: "Canada", debt_gdp: 106.4, debt_usd: 1500000000000 },
        { name: "Brazil", debt_gdp: 88.6, debt_usd: 1500000000000 },
        { name: "India", debt_gdp: 83.5, debt_usd: 2000000000000 }
    ]
};

// Create gradient for charts
function createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

// Function to create debt-to-GDP ratio chart
function createDebtToGDPChart() {
    const ctx = document.getElementById('debt-gdp-chart').getContext('2d');
    const countries = debtData.countries.map(country => country.name);
    const ratios = debtData.countries.map(country => country.debt_gdp);

    // Create gradient
    const gradient = createGradient(ctx, 'rgba(54, 162, 235, 0.8)', 'rgba(54, 162, 235, 0.2)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: countries,
            datasets: [{
                label: 'Debt-to-GDP Ratio (%)',
                data: ratios,
                backgroundColor: gradient,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 'flex',
                maxBarThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Debt-to-GDP Ratio (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Countries',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Function to create total debt chart
function createTotalDebtChart() {
    const ctx = document.getElementById('total-debt-chart').getContext('2d');
    const countries = debtData.countries.map(country => country.name);
    const debts = debtData.countries.map(country => country.debt_usd / 1e12);

    // Create gradient
    const gradient = createGradient(ctx, 'rgba(255, 99, 132, 0.8)', 'rgba(255, 99, 132, 0.2)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: countries,
            datasets: [{
                label: 'Total Debt (Trillions USD)',
                data: debts,
                backgroundColor: gradient,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 'flex',
                maxBarThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(2)} trillion`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Total Debt (Trillions USD)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '$' + value + 'T';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Countries',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Function to create debt comparison pie chart
function createDebtComparisonChart() {
    const ctx = document.getElementById('debt-comparison-chart').getContext('2d');
    const countries = debtData.countries.map(country => country.name);
    const debts = debtData.countries.map(country => country.debt_usd / 1e12);

    const colors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(40, 159, 64, 0.8)',
        'rgba(210, 199, 199, 0.8)'
    ];

    const borderColors = colors.map(color => color.replace('0.8', '1'));

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: countries,
            datasets: [{
                data: debts,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#333',
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        padding: 20,
                        boxWidth: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: $${value.toFixed(2)}T (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize all charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure the DOM is fully loaded
    setTimeout(() => {
        createDebtToGDPChart();
        createTotalDebtChart();
        createDebtComparisonChart();
    }, 100);
}); 