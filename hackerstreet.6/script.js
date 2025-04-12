// Add sample data at the beginning of the file
const sampleData = [
    { country: "United States", debtToGDP: 128.1, totalDebt: 28.4, trend: "High" },
    { country: "Japan", debtToGDP: 263.9, totalDebt: 12.2, trend: "High" },
    { country: "China", debtToGDP: 66.8, totalDebt: 8.2, trend: "Moderate" },
    { country: "Germany", debtToGDP: 69.3, totalDebt: 2.8, trend: "Moderate" },
    { country: "United Kingdom", debtToGDP: 101.9, totalDebt: 2.7, trend: "High" },
    { country: "France", debtToGDP: 112.9, totalDebt: 2.9, trend: "High" },
    { country: "Italy", debtToGDP: 150.3, totalDebt: 2.7, trend: "High" },
    { country: "Canada", debtToGDP: 89.7, totalDebt: 1.7, trend: "Moderate" },
    { country: "Brazil", debtToGDP: 88.3, totalDebt: 1.4, trend: "Moderate" },
    { country: "India", debtToGDP: 68.1, totalDebt: 1.9, trend: "Moderate" }
];

// Add missing function definitions
function addMessage(text, isUser, saveToHistory = true) {
    const chatContainer = document.querySelector('.chat-messages');
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (saveToHistory) {
        saveChatHistory(text, isUser);
    }
}

function saveChatHistory(text, isUser) {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.push({ text, isUser, timestamp: new Date().toISOString() });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.forEach(msg => addMessage(msg.text, msg.isUser, false));
}

function clearChatHistory() {
    localStorage.removeItem('chatHistory');
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
        chatContainer.innerHTML = '';
    }
    addWelcomeMessage();
}

function addWelcomeMessage() {
    addMessage("Hello! 👋 I'm your PersonalCA Assistant, your comprehensive financial guide. I can help you with:\n\n" +
               "1. 📊 Investment Strategies and Portfolio Management\n" +
               "2. 💰 Budgeting and Personal Finance Planning\n" +
               "3. 🏦 Credit Management and Loan Advice\n" +
               "4. 📈 Retirement Planning and Pension Options\n" +
               "5. 📝 Tax Planning and Optimization\n" +
               "6. 🛡️ Insurance Coverage and Risk Management\n" +
               "7. 💳 Debt Management and Payment Strategies\n" +
               "8. 🌍 Global Financial Trends and Analysis\n\n" +
               "What financial topic would you like to explore today? 💡", false);
}

// Add function to check server connection
async function checkServerConnection() {
    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'test' }),
            timeout: 5000 // 5 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }
        
        const data = await response.json();
        return data.status === 'success';
    } catch (error) {
        console.error('Server connection check failed:', error);
        return false;
    }
}

// Initialize chat interface
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const chatContainer = document.querySelector('.chat-messages');
        const messageInput = document.querySelector('.message-input');
        const sendButton = document.querySelector('.send-button');
        const refreshButton = document.querySelector('.refresh-button');

        if (!chatContainer || !messageInput || !sendButton) {
            throw new Error('Required chat elements not found in the DOM');
        }

        // Check server connection
        const isServerRunning = await checkServerConnection();
        if (!isServerRunning) {
            addMessage("⚠️ Warning: The chatbot server is not running. Please ensure:\n\n" +
                      "1. The backend server is started (run 'npm start' in the backend directory)\n" +
                      "2. The server is running on http://localhost:5000\n" +
                      "3. All required dependencies are installed\n\n" +
                      "I'll use local processing for now.", false);
        }

        // Load chat history
        loadChatHistory();

        // Add welcome message if no history exists
        if (localStorage.getItem('chatHistory') === null) {
            addWelcomeMessage();
        }

        // Event listener for refresh button
        refreshButton.addEventListener('click', () => {
            clearChatHistory();
        });

        // Event listener for send button
        sendButton.addEventListener('click', async () => {
            const message = messageInput.value.trim();
            if (message) {
                sendButton.disabled = true;
                await sendMessage(message);
                messageInput.value = '';
                sendButton.disabled = false;
            }
        });

        // Event listener for Enter key
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendButton.click();
            }
        });
    } catch (error) {
        console.error('Error initializing chat interface:', error);
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Error initializing chat interface. Please refresh the page.';
        document.body.appendChild(errorMessage);
    }
});

// Function to show loading state
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.textContent = 'Thinking...';
    chatContainer.appendChild(loadingDiv);
    return loadingDiv;
}

// Function to remove loading state
function removeLoading(loadingDiv) {
    if (loadingDiv && loadingDiv.parentNode) {
        chatContainer.removeChild(loadingDiv);
    }
}

// Function to validate input
function validateInput(message) {
    if (!message || message.trim().length === 0) {
        return false;
    }
    if (message.length > 1000) {
        return false;
    }
    return true;
}

// Add conversation context tracking
let conversationContext = {
    currentTopic: null,
    previousQuestions: [],
    userPreferences: {},
    lastResponse: null
};

// Enhanced financial calculation functions
function calculateCompoundInterest(principal, rate, time, compoundFrequency = 12) {
    const r = rate / 100;
    const n = compoundFrequency;
    const t = time;
    return principal * Math.pow(1 + r/n, n*t);
}

function calculateLoanPayment(principal, annualRate, years) {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calculateRetirementSavings(currentAge, retirementAge, currentSavings, annualContribution, expectedReturn) {
    const years = retirementAge - currentAge;
    const r = expectedReturn / 100;
    let total = currentSavings;
    for (let i = 0; i < years; i++) {
        total = (total + annualContribution) * (1 + r);
    }
    return total;
}

function calculateInvestmentGrowth(initialInvestment, monthlyContribution, years, expectedReturn, inflationRate = 2) {
    const r = expectedReturn / 100;
    const inflation = inflationRate / 100;
    let total = initialInvestment;
    for (let i = 0; i < years; i++) {
        total = (total + monthlyContribution * 12) * (1 + r);
        // Adjust for inflation
        total = total / (1 + inflation);
    }
    return total;
}

function calculateDebtPayoff(principal, interestRate, monthlyPayment, extraPayment = 0) {
    const r = interestRate / 100 / 12;
    let remaining = principal;
    let totalInterest = 0;
    let months = 0;
    
    while (remaining > 0) {
        const interest = remaining * r;
        const principalPayment = monthlyPayment - interest + extraPayment;
        remaining -= principalPayment;
        totalInterest += interest;
        months++;
        
        if (months > 1000) break; // Prevent infinite loop
    }
    
    return {
        months: months,
        totalInterest: totalInterest,
        totalPayment: principal + totalInterest
    };
}

function calculateTaxSavings(income, deductions, taxBrackets) {
    let taxableIncome = income - deductions;
    let tax = 0;
    
    for (const bracket of taxBrackets) {
        if (taxableIncome <= 0) break;
        const bracketAmount = Math.min(taxableIncome, bracket.max - bracket.min);
        tax += bracketAmount * bracket.rate;
        taxableIncome -= bracketAmount;
    }
    
    return tax;
}

function calculateInterest(principal, rate, time, type = 'simple') {
    if (type === 'simple') {
        return (principal * rate * time) / 100;
    } else {
        // Compound interest calculation
        return principal * Math.pow(1 + rate/100, time) - principal;
    }
}

// Add interactive calculation handlers
function handleCalculationRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('compound interest') || lowerMessage.includes('savings growth')) {
        return "I can help you calculate compound interest! Please provide:\n\n" +
               "1. Initial amount (principal)\n" +
               "2. Annual interest rate (in %)\n" +
               "3. Number of years\n" +
               "4. Compound frequency (optional, default is monthly)\n\n" +
               "For example: 'Calculate compound interest for $10,000 at 5% for 10 years' 💰";
    }

    if (lowerMessage.includes('loan payment') || lowerMessage.includes('mortgage')) {
        return "I can calculate your loan payments! Please provide:\n\n" +
               "1. Loan amount\n" +
               "2. Annual interest rate (in %)\n" +
               "3. Loan term in years\n\n" +
               "For example: 'Calculate monthly payment for a $200,000 loan at 4% for 30 years' 🏠";
    }

    if (lowerMessage.includes('retirement') || lowerMessage.includes('savings goal')) {
        return "I can help you calculate your retirement savings! Please provide:\n\n" +
               "1. Current age\n" +
               "2. Retirement age\n" +
               "3. Current savings\n" +
               "4. Annual contribution\n" +
               "5. Expected annual return (in %)\n\n" +
               "For example: 'Calculate retirement savings starting at age 30, retiring at 65, with $50,000 saved, contributing $10,000 annually at 7% return' 🏖️";
    }

    return "I can help you with various financial calculations! Would you like to calculate:\n\n" +
           "1. Compound interest and savings growth\n" +
           "2. Loan payments and amortization\n" +
           "3. Retirement savings goals\n" +
           "4. Investment returns\n\n" +
           "Which calculation would you like to perform? 📊";
}

// Add interactive visualization handlers
function handleVisualizationRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('visualize')) {
        return "I can create visualizations for:\n\n" +
               "1. Investment growth over time\n" +
               "2. Debt repayment schedule\n" +
               "3. Retirement savings projection\n" +
               "4. Budget allocation\n\n" +
               "Which type of visualization would you like to see? 📈";
    }

    return "Would you like to see a visual representation of your financial data? I can create charts and graphs to help you better understand:\n\n" +
           "1. Investment performance\n" +
           "2. Debt repayment progress\n" +
           "3. Savings growth\n" +
           "4. Budget breakdown\n\n" +
           "What would you like to visualize? 📊";
}

// Add personalized advice generator
function generatePersonalizedAdvice(message, userContext) {
    const lowerMessage = message.toLowerCase();
    const riskTolerance = userContext.riskTolerance || 'balanced';
    const ageGroup = userContext.ageGroup || 'general';
    const financialGoals = userContext.financialGoals || [];

    let advice = "Based on your profile, here's my personalized advice:\n\n";

    if (financialGoals.includes('retirement')) {
        advice += `1. Retirement Planning:\n` +
                 `   - ${getRetirementStrategy(ageGroup, riskTolerance)}\n\n`;
    }

    if (financialGoals.includes('investment')) {
        advice += `2. Investment Strategy:\n` +
                 `   - ${getInvestmentStrategy(riskTolerance)}\n\n`;
    }

    if (financialGoals.includes('debt')) {
        advice += `3. Debt Management:\n` +
                 `   - ${getDebtStrategy(userContext.debtLevel)}\n\n`;
    }

    advice += `Would you like more detailed advice about any of these areas? 💡`;

    return advice;
}

// Add context-aware response enhancement
function enhanceResponse(response, context) {
    if (!context.currentTopic) return response;

    const enhancedResponse = response + "\n\nRelated topics you might find helpful:\n";
    
    switch(context.currentTopic) {
        case 'investment':
            enhancedResponse += "1. Risk management strategies\n" +
                              "2. Portfolio diversification\n" +
                              "3. Market analysis techniques\n";
            break;
        case 'retirement':
            enhancedResponse += "1. Tax-efficient withdrawal strategies\n" +
                              "2. Social Security optimization\n" +
                              "3. Healthcare cost planning\n";
            break;
        case 'debt':
            enhancedResponse += "1. Debt consolidation options\n" +
                              "2. Credit score improvement\n" +
                              "3. Budgeting for debt repayment\n";
            break;
    }

    return enhancedResponse + "\nWould you like to explore any of these related topics? 🔍";
}

// Update the processDebtQuery function to use new features
function processDebtQuery(message) {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced interest calculation
    if (lowerMessage.includes('calculate interest') || 
        lowerMessage.includes('interest rate') || 
        lowerMessage.includes('how much interest')) {
        
        const numbers = message.match(/\d+/g);
        if (!numbers || numbers.length < 3) {
            return "To calculate interest, I need:\n\n" +
                   "1. Principal amount (e.g., $10,000)\n" +
                   "2. Interest rate (e.g., 5%)\n" +
                   "3. Time period in years\n" +
                   "4. (Optional) Compound frequency (monthly, quarterly, annually)\n\n" +
                   "For example: 'Calculate compound interest for $10,000 at 5% for 3 years compounded monthly'";
        }

        const principal = parseFloat(numbers[0]);
        const rate = parseFloat(numbers[1]);
        const time = parseFloat(numbers[2]);
        const isCompound = lowerMessage.includes('compound');
        const frequency = lowerMessage.includes('monthly') ? 12 : 
                         lowerMessage.includes('quarterly') ? 4 : 
                         lowerMessage.includes('annually') ? 1 : 12;
        
        const interest = isCompound ? 
            calculateCompoundInterest(principal, rate, time, frequency) - principal :
            calculateInterest(principal, rate, time);
        
        const total = principal + interest;
        
        return `Here's your interest calculation:\n\n` +
               `Principal: $${principal.toLocaleString()}\n` +
               `Interest Rate: ${rate}%\n` +
               `Time Period: ${time} years\n` +
               `Type: ${isCompound ? 'Compound' : 'Simple'} Interest\n` +
               `${isCompound ? `Compound Frequency: ${frequency} times per year\n` : ''}` +
               `Total Interest: $${interest.toFixed(2)}\n` +
               `Total Amount: $${total.toFixed(2)}\n\n` +
               `Would you like to calculate another interest rate or learn more about interest calculations? 💰`;
    }

    // Enhanced loan payment calculation
    if (lowerMessage.includes('loan payment') || lowerMessage.includes('mortgage')) {
        const numbers = message.match(/\d+/g);
        if (!numbers || numbers.length < 3) {
            return "To calculate loan payments, I need:\n\n" +
                   "1. Loan amount\n" +
                   "2. Annual interest rate (in %)\n" +
                   "3. Loan term in years\n\n" +
                   "For example: 'Calculate monthly payment for a $200,000 loan at 4% for 30 years'";
        }

        const principal = parseFloat(numbers[0]);
        const rate = parseFloat(numbers[1]);
        const years = parseFloat(numbers[2]);
        
        const monthlyPayment = calculateLoanPayment(principal, rate, years);
        const totalPayment = monthlyPayment * years * 12;
        const totalInterest = totalPayment - principal;
        
        return `Here's your loan calculation:\n\n` +
               `Loan Amount: $${principal.toLocaleString()}\n` +
               `Interest Rate: ${rate}%\n` +
               `Term: ${years} years\n\n` +
               `Monthly Payment: $${monthlyPayment.toFixed(2)}\n` +
               `Total Interest: $${totalInterest.toFixed(2)}\n` +
               `Total Payment: $${totalPayment.toFixed(2)}\n\n` +
               `Would you like to calculate a different loan scenario? 🏠`;
    }

    // Enhanced retirement calculation
    if (lowerMessage.includes('retirement') || lowerMessage.includes('savings goal')) {
        const numbers = message.match(/\d+/g);
        if (!numbers || numbers.length < 5) {
            return "To calculate retirement savings, I need:\n\n" +
                   "1. Current age\n" +
                   "2. Retirement age\n" +
                   "3. Current savings\n" +
                   "4. Annual contribution\n" +
                   "5. Expected annual return (in %)\n\n" +
                   "For example: 'Calculate retirement savings starting at age 30, retiring at 65, with $50,000 saved, contributing $10,000 annually at 7% return'";
        }

        const currentAge = parseFloat(numbers[0]);
        const retirementAge = parseFloat(numbers[1]);
        const currentSavings = parseFloat(numbers[2]);
        const annualContribution = parseFloat(numbers[3]);
        const expectedReturn = parseFloat(numbers[4]);
        
        const total = calculateRetirementSavings(currentAge, retirementAge, currentSavings, annualContribution, expectedReturn);
        
        return `Here's your retirement calculation:\n\n` +
               `Current Age: ${currentAge}\n` +
               `Retirement Age: ${retirementAge}\n` +
               `Current Savings: $${currentSavings.toLocaleString()}\n` +
               `Annual Contribution: $${annualContribution.toLocaleString()}\n` +
               `Expected Return: ${expectedReturn}%\n\n` +
               `Projected Retirement Savings: $${total.toFixed(2)}\n\n` +
               `Would you like to explore different retirement scenarios? 🏖️`;
    }

    // Check for investment queries
    if (lowerMessage.includes('invest') || lowerMessage.includes('investment') || lowerMessage.includes('portfolio')) {
        return "I can help you with investment strategies! Please tell me:\n\n" +
               "1. Your investment goals (e.g., retirement, short-term gains)\n" +
               "2. Your risk tolerance (low, medium, high)\n" +
               "3. Your investment timeframe\n\n" +
               "For example: 'I want to invest for retirement with medium risk over 20 years'";
    }

    // Check for budget queries
    if (lowerMessage.includes('budget') || lowerMessage.includes('saving') || lowerMessage.includes('spending')) {
        return "I can help you create a budget! Please provide:\n\n" +
               "1. Your monthly income\n" +
               "2. Your fixed expenses (rent, utilities, etc.)\n" +
               "3. Your savings goals\n\n" +
               "For example: 'My monthly income is $5000, fixed expenses are $2000, and I want to save $1000 per month'";
    }

    // Check for debt management queries
    if (lowerMessage.includes('debt') || lowerMessage.includes('loan') || lowerMessage.includes('credit')) {
        return "I can help you manage your debt! Please tell me:\n\n" +
               "1. Your total debt amount\n" +
               "2. Interest rates on your debts\n" +
               "3. Your monthly payment capacity\n\n" +
               "For example: 'I have $20,000 in debt at 15% interest and can pay $500 monthly'";
    }

    // Check for retirement planning queries
    if (lowerMessage.includes('retirement') || lowerMessage.includes('401k') || lowerMessage.includes('pension')) {
        return "I can help you plan for retirement! Please provide:\n\n" +
               "1. Your current age\n" +
               "2. Your desired retirement age\n" +
               "3. Your current savings\n" +
               "4. Your monthly contribution capacity\n\n" +
               "For example: 'I'm 30 years old, want to retire at 65, have $50,000 saved, and can contribute $1000 monthly'";
    }

    // Update conversation context
    conversationContext.previousQuestions.push(message);
    if (conversationContext.previousQuestions.length > 5) {
        conversationContext.previousQuestions.shift();
    }

    // Check for follow-up questions
    if (conversationContext.lastResponse && 
        (lowerMessage.includes('more') || 
         lowerMessage.includes('explain') || 
         lowerMessage.includes('tell me') || 
         lowerMessage.includes('what about'))) {
        return handleFollowUp(conversationContext.lastResponse, message);
    }

    // Check for topic changes
    if (lowerMessage.includes('let\'s talk about') || 
        lowerMessage.includes('switch to') || 
        lowerMessage.includes('change topic')) {
        return handleTopicChange(message);
    }

    // Check for clarification requests
    if (lowerMessage.includes('what do you mean') || 
        lowerMessage.includes('can you explain') || 
        lowerMessage.includes('i don\'t understand')) {
        return handleClarification(message);
    }

    // Check for specific financial topics
    if (lowerMessage.includes('invest') || lowerMessage.includes('stock') || lowerMessage.includes('portfolio')) {
        conversationContext.currentTopic = 'investment';
        return generateInvestmentResponse(message);
    }

    if (lowerMessage.includes('budget') || lowerMessage.includes('save') || lowerMessage.includes('spending')) {
        conversationContext.currentTopic = 'budgeting';
        return generateBudgetingResponse(message);
    }

    if (lowerMessage.includes('retirement') || lowerMessage.includes('401k') || lowerMessage.includes('pension')) {
        conversationContext.currentTopic = 'retirement';
        return generateRetirementResponse(message);
    }

    if (lowerMessage.includes('tax') || lowerMessage.includes('deduction') || lowerMessage.includes('irs')) {
        conversationContext.currentTopic = 'tax';
        return generateTaxResponse(message);
    }

    if (lowerMessage.includes('credit') || lowerMessage.includes('score') || lowerMessage.includes('loan')) {
        conversationContext.currentTopic = 'credit';
        return generateCreditResponse(message);
    }

    if (lowerMessage.includes('insurance') || lowerMessage.includes('coverage') || lowerMessage.includes('premium')) {
        conversationContext.currentTopic = 'insurance';
        return generateInsuranceResponse(message);
    }

    // Handle general financial advice
    if (lowerMessage.includes('advice') || lowerMessage.includes('help') || lowerMessage.includes('suggest')) {
        return generateGeneralAdvice(message);
    }

    // Handle country-specific queries
    const countryMatch = lowerMessage.match(/(debt|debt-to-gdp|total debt) (in|of|for) (\w+)/i);
    if (countryMatch) {
        return handleCountryQuery(countryMatch[3]);
    }

    // Handle comparative queries
    if (lowerMessage.includes('compare') || lowerMessage.includes('difference')) {
        return handleComparativeQuery(message);
    }

    // Add calculation handling
    if (message.match(/\d+/)) {  // If message contains numbers
        const calculationResponse = handleCalculationRequest(message);
        if (calculationResponse) {
            conversationContext.lastResponse = calculationResponse;
            return calculationResponse;
        }
    }

    // Add visualization handling
    if (message.toLowerCase().includes('show') || 
        message.toLowerCase().includes('visualize')) {
        const visualizationResponse = handleVisualizationRequest(message);
        if (visualizationResponse) {
            conversationContext.lastResponse = visualizationResponse;
            return visualizationResponse;
        }
    }

    // Add personalized advice
    if (message.toLowerCase().includes('personalized') || 
        message.toLowerCase().includes('for me')) {
        const personalizedResponse = generatePersonalizedAdvice(message, conversationContext.userPreferences);
        conversationContext.lastResponse = personalizedResponse;
        return personalizedResponse;
    }

    // Default response with context awareness
    return generateContextualResponse(message);
}

// Helper functions for different response types
function handleFollowUp(lastResponse, message) {
    const topic = conversationContext.currentTopic;
    if (topic) {
        return `Let me elaborate on that ${topic} topic:\n\n` +
               `Based on your previous question about "${conversationContext.previousQuestions[conversationContext.previousQuestions.length - 2]}", ` +
               `here's more detailed information:\n\n` +
               generateDetailedResponse(topic, message);
    }
    return "I'd be happy to provide more information. Could you specify which aspect you'd like me to elaborate on?";
}

function handleTopicChange(message) {
    const newTopic = message.toLowerCase().match(/about (.*?)$/i)?.[1] || 
                    message.toLowerCase().match(/to (.*?)$/i)?.[1];
    if (newTopic) {
        conversationContext.currentTopic = newTopic.trim();
        return `I'd be happy to discuss ${newTopic.trim()} with you! What specific aspect would you like to know about?`;
    }
    return "I'd be happy to change topics. What would you like to discuss?";
}

function handleClarification(message) {
    if (conversationContext.lastResponse) {
        return `Let me explain that in a different way:\n\n` +
               `When I mentioned "${conversationContext.lastResponse.split('\n')[0]}", what I meant was...\n\n` +
               generateSimplifiedExplanation(conversationContext.currentTopic);
    }
    return "I'd be happy to clarify. Could you tell me which part you'd like me to explain further?";
}

function generateInvestmentResponse(message) {
    const riskLevel = message.toLowerCase().includes('safe') ? 'conservative' : 
                     message.toLowerCase().includes('risky') ? 'aggressive' : 'balanced';
    
    return `Based on your interest in ${riskLevel} investments, here's what I recommend:\n\n` +
           `1. For ${riskLevel} investing, consider:\n` +
           `   - ${getInvestmentOptions(riskLevel)}\n` +
           `2. Key strategies:\n` +
           `   - ${getInvestmentStrategies(riskLevel)}\n` +
           `3. Risk management:\n` +
           `   - ${getRiskManagementTips(riskLevel)}\n\n` +
           `Would you like to know more about any of these aspects? 📈`;
}

function generateBudgetingResponse(message) {
    const timeframe = message.toLowerCase().includes('monthly') ? 'monthly' : 
                     message.toLowerCase().includes('yearly') ? 'yearly' : 'general';
    
    return `Let's create a ${timeframe} budgeting plan:\n\n` +
           `1. Income tracking:\n` +
           `   - ${getIncomeTrackingTips(timeframe)}\n` +
           `2. Expense management:\n` +
           `   - ${getExpenseManagementTips(timeframe)}\n` +
           `3. Savings goals:\n` +
           `   - ${getSavingsStrategies(timeframe)}\n\n` +
           `Would you like me to help you create a personalized ${timeframe} budget? 💵`;
}

// Helper functions for generating detailed responses
function getInvestmentOptions(riskLevel) {
    const options = {
        conservative: "Government bonds, high-grade corporate bonds, and dividend-paying stocks",
        balanced: "A mix of stocks and bonds (60/40 split), index funds, and REITs",
        aggressive: "Growth stocks, emerging markets, and sector-specific ETFs"
    };
    return options[riskLevel] || "A diversified portfolio based on your risk tolerance";
}

function getInvestmentStrategies(riskLevel) {
    const strategies = {
        conservative: "Focus on capital preservation and steady income",
        balanced: "Balance between growth and income, with regular rebalancing",
        aggressive: "Focus on long-term growth with higher volatility tolerance"
    };
    return strategies[riskLevel] || "A strategy aligned with your financial goals";
}

function getRiskManagementTips(riskLevel) {
    const tips = {
        conservative: "Maintain a large emergency fund and focus on liquidity",
        balanced: "Regular portfolio rebalancing and diversification across sectors",
        aggressive: "Regular monitoring and setting stop-loss orders for volatile positions"
    };
    return tips[riskLevel] || "Regular review and adjustment of your investment strategy";
}

function getIncomeTrackingTips(timeframe) {
    const tips = {
        monthly: "Track all sources of income, including salary, bonuses, and side gigs",
        yearly: "Consider annual bonuses, tax refunds, and investment income",
        general: "Maintain a comprehensive record of all income sources"
    };
    return tips[timeframe] || "Keep detailed records of all income sources";
}

function getExpenseManagementTips(timeframe) {
    const tips = {
        monthly: "Categorize expenses and set monthly spending limits",
        yearly: "Plan for annual expenses and seasonal variations",
        general: "Use budgeting apps or spreadsheets to track all expenses"
    };
    return tips[timeframe] || "Monitor and categorize all expenses regularly";
}

function getSavingsStrategies(timeframe) {
    const strategies = {
        monthly: "Set aside a fixed percentage of income each month",
        yearly: "Plan for major annual savings goals and emergencies",
        general: "Follow the 50/30/20 rule for needs, wants, and savings"
    };
    return strategies[timeframe] || "Set specific savings goals and track progress";
}

function generateRetirementResponse(message) {
    const ageGroup = message.toLowerCase().includes('young') ? 'young' :
                    message.toLowerCase().includes('middle') ? 'middle' :
                    message.toLowerCase().includes('near') ? 'near' : 'general';
    
    return `Based on your ${ageGroup} retirement planning needs:\n\n` +
           `1. Investment strategy:\n` +
           `   - ${getRetirementInvestmentStrategy(ageGroup)}\n` +
           `2. Savings targets:\n` +
           `   - ${getRetirementSavingsTargets(ageGroup)}\n` +
           `3. Account types:\n` +
           `   - ${getRetirementAccountTypes(ageGroup)}\n\n` +
           `Would you like to calculate your specific retirement needs? 🏖️`;
}

function getRetirementInvestmentStrategy(ageGroup) {
    const strategies = {
        young: "Focus on growth investments with higher risk tolerance",
        middle: "Balance between growth and income investments",
        near: "Focus on capital preservation and income generation",
        general: "Diversified portfolio based on your time horizon"
    };
    return strategies[ageGroup] || "A strategy based on your retirement timeline";
}

function getRetirementSavingsTargets(ageGroup) {
    const targets = {
        young: "Aim to save 15% of income, including employer match",
        middle: "Catch-up contributions and accelerated savings",
        near: "Focus on preserving capital and generating income",
        general: "Regular contributions based on your retirement goals"
    };
    return targets[ageGroup] || "Regular savings based on your retirement timeline";
}

function getRetirementAccountTypes(ageGroup) {
    const accounts = {
        young: "Maximize Roth IRA and 401(k) contributions",
        middle: "Consider traditional and Roth options based on tax situation",
        near: "Focus on required minimum distributions and tax efficiency",
        general: "A mix of tax-advantaged accounts based on your situation"
    };
    return accounts[ageGroup] || "Appropriate retirement accounts for your situation";
}

function handleCountryQuery(country) {
    const countryData = sampleData.find(d => d.country.toLowerCase() === country.toLowerCase());
    if (countryData) {
        return `Here's a detailed analysis of ${countryData.country}'s financial situation:\n\n` +
               `1. Economic Overview:\n` +
               `   - Debt-to-GDP Ratio: ${countryData.debtToGDP}%\n` +
               `   - Total Debt: $${countryData.totalDebt} trillion\n` +
               `   - Trend: ${countryData.trend}\n\n` +
               `2. Comparative Analysis:\n` +
               `   - ${getComparativeAnalysis(countryData)}\n\n` +
               `3. Key Considerations:\n` +
               `   - ${getCountryConsiderations(countryData)}\n\n` +
               `Would you like to know more about specific aspects of ${countryData.country}'s economy? 🌍`;
    }
    return "I don't have specific data for that country. Would you like information about a different country or general financial advice?";
}

function getComparativeAnalysis(countryData) {
    const avgDebt = sampleData.reduce((sum, d) => sum + d.debtToGDP, 0) / sampleData.length;
    const comparison = countryData.debtToGDP > avgDebt ? "above" : "below";
    return `The debt-to-GDP ratio is ${comparison} the global average of ${avgDebt.toFixed(1)}%`;
}

function getCountryConsiderations(countryData) {
    const considerations = {
        high: "Focus on debt reduction strategies and economic growth",
        moderate: "Maintain current policies while monitoring debt levels",
        low: "Consider strategic investments in infrastructure and development"
    };
    return considerations[countryData.trend.toLowerCase()] || "Monitor economic indicators regularly";
}

// Update the sendMessage function to work with our new Python backend
async function sendMessage(message) {
    if (!message.trim()) return;

    // Add user message to chat
    addMessage(message, true);

    try {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'message ai-message typing';
        loadingIndicator.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        document.querySelector('.chat-messages').appendChild(loadingIndicator);
        loadingIndicator.scrollIntoView({ behavior: 'smooth' });

        // First check if server is running
        const isServerRunning = await checkServerConnection();
        if (!isServerRunning) {
            loadingIndicator.remove();
            addMessage("⚠️ The chatbot server is not running. Please ensure:\n\n" +
                      "1. The backend server is started (run 'npm start' in the backend directory)\n" +
                      "2. The server is running on http://localhost:5000\n" +
                      "3. All required dependencies are installed\n\n" +
                      "I'll use local processing for now.", false);
            const localResponse = processDebtQuery(message);
            addMessage(localResponse, false);
            return;
        }

        // Send message to backend
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
            timeout: 10000 // 10 second timeout
        });

        // Remove loading indicator
        loadingIndicator.remove();

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success' && data.response) {
            addMessage(data.response, false);
        } else {
            throw new Error('Invalid response format from server');
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback to local processing if server is down
        const localResponse = processDebtQuery(message);
        addMessage(localResponse || 'I apologize, but I\'m having trouble processing your request. Please try again later.', false);
    }
}