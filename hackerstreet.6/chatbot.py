from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Sample financial data
financial_data = {
    "countries": {
        "United States": {"debt_to_gdp": 128.1, "total_debt": 28.4, "trend": "High"},
        "Japan": {"debt_to_gdp": 263.9, "total_debt": 12.2, "trend": "High"},
        "China": {"debt_to_gdp": 66.8, "total_debt": 8.2, "trend": "Moderate"},
        "Germany": {"debt_to_gdp": 69.3, "total_debt": 2.8, "trend": "Moderate"},
        "United Kingdom": {"debt_to_gdp": 101.9, "total_debt": 2.7, "trend": "High"}
    },
    "investment_strategies": {
        "conservative": ["Government bonds", "High-grade corporate bonds", "Dividend-paying stocks"],
        "balanced": ["60/40 stocks/bonds", "Index funds", "REITs"],
        "aggressive": ["Growth stocks", "Emerging markets", "Sector-specific ETFs"]
    },
    "retirement_advice": {
        "young": "Focus on growth investments with higher risk tolerance",
        "middle": "Balance between growth and income investments",
        "near": "Focus on capital preservation and income generation"
    }
}

# Chat history storage
chat_history = []

def process_message(message):
    try:
        message = message.lower()
        
        # Check for country-specific queries
        for country in financial_data["countries"]:
            if country.lower() in message:
                data = financial_data["countries"][country]
                return {
                    "response": f"Here's the financial data for {country}:\n\n" \
                              f"📊 Debt-to-GDP Ratio: {data['debt_to_gdp']}%\n" \
                              f"💰 Total Debt: ${data['total_debt']} trillion\n" \
                              f"📈 Trend: {data['trend']}\n\n" \
                              f"Would you like to compare this with other countries?",
                    "status": "success"
                }

        # Check for investment queries
        if "invest" in message or "portfolio" in message:
            if "conservative" in message:
                strategies = financial_data["investment_strategies"]["conservative"]
            elif "aggressive" in message:
                strategies = financial_data["investment_strategies"]["aggressive"]
            else:
                strategies = financial_data["investment_strategies"]["balanced"]
            
            return {
                "response": "Here are some investment strategies:\n\n" + \
                           "\n".join([f"• {strategy}" for strategy in strategies]) + \
                           "\n\nWould you like more specific advice?",
                "status": "success"
            }

        # Check for retirement queries
        if "retirement" in message:
            if "young" in message:
                advice = financial_data["retirement_advice"]["young"]
            elif "middle" in message:
                advice = financial_data["retirement_advice"]["middle"]
            elif "near" in message:
                advice = financial_data["retirement_advice"]["near"]
            else:
                advice = "It's important to start planning early. Would you like specific advice for your age group?"
            
            return {
                "response": f"Retirement Planning Advice:\n\n{advice}\n\nWould you like more detailed information?",
                "status": "success"
            }

        # Check for highest/lowest debt queries
        if "highest" in message and "debt" in message:
            highest = max(financial_data["countries"].items(), key=lambda x: x[1]["debt_to_gdp"])
            return {
                "response": f"The country with the highest debt-to-GDP ratio is {highest[0]} at {highest[1]['debt_to_gdp']}%.",
                "status": "success"
            }

        if "lowest" in message and "debt" in message:
            lowest = min(financial_data["countries"].items(), key=lambda x: x[1]["debt_to_gdp"])
            return {
                "response": f"The country with the lowest debt-to-GDP ratio is {lowest[0]} at {lowest[1]['debt_to_gdp']}%.",
                "status": "success"
            }

        # Default response
        return {
            "response": "I can help you with:\n\n" \
                       "1. Country-specific financial data\n" \
                       "2. Investment strategies\n" \
                       "3. Retirement planning\n" \
                       "4. Debt comparisons\n\n" \
                       "What would you like to know more about?",
            "status": "success"
        }
    except Exception as e:
        return {
            "response": "I'm sorry, I encountered an error processing your request. Please try again.",
            "status": "error",
            "error": str(e)
        }

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Get the message from the request
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                "error": "No message provided",
                "status": "error"
            }), 400

        message = data['message']
        
        # Process the message
        result = process_message(message)
        
        # Store chat history
        chat_history.append({
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "response": result["response"],
            "status": result["status"]
        })
        
        # Return the response
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify(chat_history)

if __name__ == '__main__':
    print("Starting chatbot server...")
    app.run(debug=True, port=5000, host='0.0.0.0') 