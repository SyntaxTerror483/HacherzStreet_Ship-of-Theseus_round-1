document.addEventListener('DOMContentLoaded', () => {
    // Sample data for demonstration
    const debtData = {
        totalDebt: 25000,
        monthlyPayment: 500,
        interestRate: 0.15,
        monthsToPayoff: 60,
        paymentHistory: [
            { month: 'Jan', amount: 500, principal: 300, interest: 200 },
            { month: 'Feb', amount: 500, principal: 310, interest: 190 },
            { month: 'Mar', amount: 500, principal: 320, interest: 180 },
            { month: 'Apr', amount: 500, principal: 330, interest: 170 },
            { month: 'May', amount: 500, principal: 340, interest: 160 },
            { month: 'Jun', amount: 500, principal: 350, interest: 150 }
        ]
    };

    // Update dashboard metrics
    function updateMetrics() {
        document.getElementById('total-debt').textContent = `$${debtData.totalDebt.toLocaleString()}`;
        document.getElementById('monthly-payment').textContent = `$${debtData.monthlyPayment.toLocaleString()}`;
        document.getElementById('interest-rate').textContent = `${(debtData.interestRate * 100).toFixed(2)}%`;
        document.getElementById('months-to-payoff').textContent = `${debtData.monthsToPayoff} months`;
    }

    // Create payment history chart
    function createPaymentChart() {
        const ctx = document.getElementById('payment-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: debtData.paymentHistory.map(item => item.month),
                datasets: [
                    {
                        label: 'Principal',
                        data: debtData.paymentHistory.map(item => item.principal),
                        backgroundColor: '#1976d2'
                    },
                    {
                        label: 'Interest',
                        data: debtData.paymentHistory.map(item => item.interest),
                        backgroundColor: '#ffd700'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount ($)'
                        }
                    }
                }
            }
        });
    }

    // Create debt reduction timeline
    function createTimelineChart() {
        const ctx = document.getElementById('timeline-chart').getContext('2d');
        const remainingDebt = [];
        let currentDebt = debtData.totalDebt;
        
        for (let i = 0; i <= debtData.monthsToPayoff; i++) {
            remainingDebt.push(currentDebt);
            currentDebt -= debtData.monthlyPayment;
            if (currentDebt < 0) currentDebt = 0;
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: debtData.monthsToPayoff + 1}, (_, i) => `Month ${i}`),
                datasets: [{
                    label: 'Remaining Debt',
                    data: remainingDebt,
                    borderColor: '#1976d2',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Debt ($)'
                        }
                    }
                }
            }
        });
    }

    // Initialize dashboard
    updateMetrics();
    createPaymentChart();
    createTimelineChart();
}); 