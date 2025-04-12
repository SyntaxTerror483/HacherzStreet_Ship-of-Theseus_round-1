from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import json
import os
from datetime import datetime
from data_processor import DebtDataProcessor

app = Flask(__name__)
CORS(app)

# Initialize the model and tokenizer
model_name = "microsoft/DialoGPT-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Create a text generation pipeline
chatbot = pipeline("text-generation", model=model, tokenizer=tokenizer)

# Initialize the debt data processor with error handling
try:
    data_file = 'global_debt_data.csv'
    if not os.path.exists(data_file):
        raise FileNotFoundError(f"Data file {data_file} not found. Please download the dataset from Kaggle.")
    data_processor = DebtDataProcessor(data_file)
    print(f"Successfully loaded data from {data_file}")
except Exception as e:
    print(f"Error initializing data processor: {str(e)}")
    data_processor = None

# Enhanced financial knowledge base
financial_knowledge = {
    "debt_to_gdp": {
        "United States": {"ratio": 128.1, "trend": "Increasing", "year": 2023},
        "Japan": {"ratio": 263.9, "trend": "Stable", "year": 2023},
        "China": {"ratio": 66.8, "trend": "Increasing", "year": 2023},
        "Germany": {"ratio": 69.3, "trend": "Decreasing", "year": 2023},
        "United Kingdom": {"ratio": 101.9, "trend": "Increasing", "year": 2023},
        "France": {"ratio": 112.9, "trend": "Stable", "year": 2023},
        "Italy": {"ratio": 144.4, "trend": "Increasing", "year": 2023},
        "Canada": {"ratio": 107.2, "trend": "Increasing", "year": 2023},
        "Brazil": {"ratio": 88.6, "trend": "Decreasing", "year": 2023},
        "India": {"ratio": 83.4, "trend": "Increasing", "year": 2023}
    },
    "investment_strategies": {
        "conservative": {
            "description": "Low-risk investments focusing on capital preservation",
            "options": [
                "Government bonds (Treasury securities)",
                "High-grade corporate bonds",
                "Dividend-paying blue-chip stocks",
                "Money market funds",
                "Certificates of Deposit (CDs)"
            ],
            "risk_level": "Low",
            "expected_return": "2-4% annually"
        },
        "balanced": {
            "description": "Moderate-risk investments balancing growth and income",
            "options": [
                "60/40 stocks/bonds portfolio",
                "Index funds (S&P 500, Total Market)",
                "REITs (Real Estate Investment Trusts)",
                "Corporate bond funds",
                "Dividend growth stocks"
            ],
            "risk_level": "Medium",
            "expected_return": "4-7% annually"
        },
        "aggressive": {
            "description": "High-risk investments focusing on growth",
            "options": [
                "Growth stocks (Tech, Biotech)",
                "Emerging markets funds",
                "Sector-specific ETFs",
                "Small-cap stocks",
                "Cryptocurrencies (with caution)"
            ],
            "risk_level": "High",
            "expected_return": "7-12% annually"
        }
    },
    "retirement_advice": {
        "young": {
            "strategy": "Focus on growth investments with higher risk tolerance",
            "recommendations": [
                "Maximize 401(k) contributions",
                "Consider Roth IRA for tax-free growth",
                "Invest in growth-oriented mutual funds",
                "Maintain emergency fund of 3-6 months expenses",
                "Consider real estate investments"
            ],
            "risk_tolerance": "High",
            "time_horizon": "30+ years"
        },
        "middle": {
            "strategy": "Balance between growth and income investments",
            "recommendations": [
                "Continue maxing out retirement accounts",
                "Diversify into income-generating assets",
                "Consider target-date funds",
                "Review and adjust asset allocation annually",
                "Plan for healthcare costs"
            ],
            "risk_tolerance": "Medium",
            "time_horizon": "15-30 years"
        },
        "near": {
            "strategy": "Focus on capital preservation and income generation",
            "recommendations": [
                "Shift to conservative investments",
                "Consider annuities for guaranteed income",
                "Maintain cash reserves",
                "Review Social Security claiming strategy",
                "Plan for required minimum distributions"
            ],
            "risk_tolerance": "Low",
            "time_horizon": "0-15 years"
        }
    },
    "financial_terms": {
        "debt_to_gdp": "The ratio of a country's debt to its Gross Domestic Product, indicating its ability to pay back debts",
        "inflation": "The rate at which prices for goods and services rise, reducing purchasing power",
        "interest_rate": "The cost of borrowing money or the return on invested funds",
        "portfolio": "A collection of financial investments like stocks, bonds, and cash",
        "diversification": "Spreading investments across different assets to reduce risk",
        "compound_interest": "Interest earned on both the initial principal and accumulated interest",
        "asset_allocation": "The distribution of investments across different asset classes",
        "risk_tolerance": "An investor's ability to endure market volatility"
    }
}

def process_debt_query(message):
    if not data_processor:
        return "I'm sorry, but I'm currently unable to access the debt data. Please try again later."
        
    message = message.lower()
    
    try:
        # Check for country-specific queries
        for country in data_processor.countries:
            if country.lower() in message:
                data = data_processor.get_country_debt(country)
                if data:
                    return f"Here's the financial data for {country}:\n\n" \
                           f"📊 Debt-to-GDP Ratio: {data['debt_to_gdp']}% (as of {data['year']})\n" \
                           f"💰 Total Debt: ${data['total_debt']:,.2f} trillion\n" \
                           f"📈 Trend: {data['trend']}\n\n" \
                           f"Would you like to compare this with other countries or get historical data?"

        # Check for highest/lowest debt queries
        if "highest" in message and "debt" in message:
            top_countries = data_processor.get_top_countries(highest=True)
            response = "Countries with highest debt-to-GDP ratios:\n\n"
            for _, row in top_countries.iterrows():
                response += f"• {row['Country']}: {row['Debt-to-GDP Ratio']}%\n"
            return response + "\nWould you like more details about any of these countries?"

        if "lowest" in message and "debt" in message:
            top_countries = data_processor.get_top_countries(highest=False)
            response = "Countries with lowest debt-to-GDP ratios:\n\n"
            for _, row in top_countries.iterrows():
                response += f"• {row['Country']}: {row['Debt-to-GDP Ratio']}%\n"
            return response + "\nWould you like more details about any of these countries?"

        # Check for global average queries
        if "average" in message or "global" in message:
            global_data = data_processor.get_global_average()
            return f"Global Debt Statistics:\n\n" \
                   f"📊 Average Debt-to-GDP Ratio: {global_data['avg_debt_to_gdp']:.1f}%\n" \
                   f"💰 Total Global Debt: ${global_data['total_global_debt']:,.2f} trillion\n" \
                   f"📅 Year: {global_data['year']}\n\n" \
                   f"Would you like to see how this compares to specific countries?"

        # Check for comparison queries
        if "compare" in message:
            countries = [c for c in data_processor.countries if c.lower() in message]
            if len(countries) >= 2:
                comparison = data_processor.get_comparison(countries)
                response = "Comparison of selected countries:\n\n"
                for data in comparison:
                    response += f"• {data['country']}:\n" \
                              f"  - Debt-to-GDP: {data['debt_to_gdp']}%\n" \
                              f"  - Total Debt: ${data['total_debt']:,.2f} trillion\n" \
                              f"  - Trend: {data['trend']}\n\n"
                return response + "Would you like to compare other countries?"

        # Check for historical data queries
        if "historical" in message or "trend" in message:
            for country in data_processor.countries:
                if country.lower() in message:
                    historical_data = data_processor.get_historical_data(country)
                    if not historical_data.empty:
                        response = f"Historical Debt Data for {country}:\n\n"
                        for _, row in historical_data.iterrows():
                            response += f"• {row['Year']}: {row['Debt-to-GDP Ratio']}% " \
                                      f"(${row['Total Debt (USD)']:,.2f} trillion)\n"
                        return response + "\nWould you like to analyze this trend further?"

    except Exception as e:
        print(f"Error processing debt query: {str(e)}")
        return "I'm sorry, I encountered an error processing your request. Please try again."

    return None

def process_financial_query(message):
    message = message.lower()
    
    # Check for country-specific queries
    for country in financial_knowledge["debt_to_gdp"]:
        if country.lower() in message:
            data = financial_knowledge["debt_to_gdp"][country]
            return f"Here's the financial data for {country}:\n\n" \
                   f"📊 Debt-to-GDP Ratio: {data['ratio']}% (as of {data['year']})\n" \
                   f"📈 Trend: {data['trend']}\n\n" \
                   f"Would you like to compare this with other countries or get more details?"

    # Check for investment queries
    if "invest" in message or "portfolio" in message:
        if "conservative" in message:
            strategy = financial_knowledge["investment_strategies"]["conservative"]
        elif "aggressive" in message:
            strategy = financial_knowledge["investment_strategies"]["aggressive"]
        else:
            strategy = financial_knowledge["investment_strategies"]["balanced"]
            
        return f"Here's information about {strategy['description']}:\n\n" \
               f"Risk Level: {strategy['risk_level']}\n" \
               f"Expected Return: {strategy['expected_return']}\n\n" \
               f"Investment Options:\n" + "\n".join([f"- {option}" for option in strategy['options']]) + \
               f"\n\nWould you like more specific advice about any of these options?"

    # Check for retirement queries
    if "retirement" in message:
        if "young" in message:
            advice = financial_knowledge["retirement_advice"]["young"]
        elif "middle" in message:
            advice = financial_knowledge["retirement_advice"]["middle"]
        elif "near" in message:
            advice = financial_knowledge["retirement_advice"]["near"]
        else:
            return "It's important to start planning early. Would you like specific advice for your age group?"
            
        return f"Retirement Planning Advice:\n\n" \
               f"Strategy: {advice['strategy']}\n" \
               f"Risk Tolerance: {advice['risk_tolerance']}\n" \
               f"Time Horizon: {advice['time_horizon']}\n\n" \
               f"Recommendations:\n" + "\n".join([f"- {rec}" for rec in advice['recommendations']]) + \
               f"\n\nWould you like more detailed information about any of these recommendations?"

    # Check for financial term definitions
    for term, definition in financial_knowledge["financial_terms"].items():
        if term in message:
            return f"Definition of {term}:\n\n{definition}\n\nWould you like to know more about related concepts?"

    return None

def generate_response(message):
    # First try to get a factual response from our debt data
    debt_response = process_debt_query(message)
    if debt_response:
        return debt_response

    # If no debt-related response, try the financial knowledge base
    financial_response = process_financial_query(message)
    if financial_response:
        return financial_response

    # If no factual response, generate a conversational response
    try:
        response = chatbot(message, max_length=150, num_return_sequences=1)[0]['generated_text']
        return response
    except Exception as e:
        return f"I'm sorry, I encountered an error: {str(e)}"

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "No message provided"}), 400

        message = data['message']
        response = generate_response(message)
        
        return jsonify({
            "response": response,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == '__main__':
    print("Starting enhanced financial chatbot server...")
    app.run(debug=True, port=5000, host='0.0.0.0') 