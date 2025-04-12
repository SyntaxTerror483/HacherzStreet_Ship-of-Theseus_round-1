from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re
import json
import logging
from logging.handlers import RotatingFileHandler
import os
from dotenv import load_dotenv
from functools import wraps
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
logger.addHandler(handler)

# Download NLTK resources
try:
    nltk.download('punkt')
    nltk.download('stopwords')
except Exception as e:
    logger.error(f"Error downloading NLTK resources: {str(e)}")

app = Flask(__name__)
CORS(app)

# Rate limiting decorator
def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Simple rate limiting - 10 requests per minute
        if not hasattr(app, 'request_times'):
            app.request_times = []
        current_time = time.time()
        app.request_times = [t for t in app.request_times if current_time - t < 60]
        if len(app.request_times) >= 10:
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        app.request_times.append(current_time)
        return f(*args, **kwargs)
    return decorated_function

# Global debt data
debt_data = {
    "countries": [
        {"name": "United States", "debt_gdp": 123.4, "debt_usd": 30000000000000},
        {"name": "Japan", "debt_gdp": 264.1, "debt_usd": 12000000000000},
        {"name": "China", "debt_gdp": 77.1, "debt_usd": 15000000000000},
        {"name": "United Kingdom", "debt_gdp": 101.9, "debt_usd": 3000000000000},
        {"name": "France", "debt_gdp": 112.9, "debt_usd": 3000000000000},
        {"name": "Italy", "debt_gdp": 150.8, "debt_usd": 3000000000000},
        {"name": "Germany", "debt_gdp": 69.3, "debt_usd": 3000000000000},
        {"name": "Canada", "debt_gdp": 106.4, "debt_usd": 1500000000000},
        {"name": "Brazil", "debt_gdp": 88.6, "debt_usd": 1500000000000},
        {"name": "India", "debt_gdp": 83.5, "debt_usd": 2000000000000}
    ]
}

# Knowledge base for responses
knowledge_base = {
    "greeting": [
        "Hello! 👋 I'm your AI debt management assistant. How can I help you today?",
        "Hi there! I'm here to help with debt management. What would you like to know?",
        "Welcome! I can help you understand global debt and create payment plans. What would you like to know?"
    ],
    "capabilities": [
        "I can help you with:\n1. 📊 Global debt information\n2. 💰 Payment planning\n3. 🌍 Country-specific data\n4. 📈 Financial insights",
        "I specialize in:\n- Debt analysis\n- Payment planning\n- Country comparisons\n- Financial advice"
    ],
    "payment_plan": [
        "I can help create a payment plan. Please provide:\n1. Total debt amount\n2. Interest rate\n3. Repayment period",
        "For a payment plan, I need:\n- Debt amount\n- Interest rate\n- Years to repay"
    ],
    "error": [
        "I'm not sure I understand. Could you rephrase that?",
        "I need more information to help with that. Could you be more specific?",
        "I'm not sure about that. Could you ask something else?"
    ]
}

def preprocess_text(text):
    """Preprocess text for similarity comparison"""
    try:
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        tokens = word_tokenize(text)
        stop_words = set(stopwords.words('english'))
        tokens = [token for token in tokens if token not in stop_words]
        return ' '.join(tokens)
    except Exception as e:
        logger.error(f"Error in text preprocessing: {str(e)}")
        return text.lower()

def calculate_payment_plan(principal, interest_rate, years):
    """Calculate payment plan details"""
    try:
        if principal <= 0 or interest_rate <= 0 or years <= 0:
            raise ValueError("All values must be positive")
        
        monthly_rate = interest_rate / 12 / 100
        num_payments = years * 12
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate)**num_payments) / ((1 + monthly_rate)**num_payments - 1)
        total_payment = monthly_payment * num_payments
        total_interest = total_payment - principal
        
        return {
            "monthly_payment": round(monthly_payment, 2),
            "total_interest": round(total_interest, 2),
            "total_payment": round(total_payment, 2),
            "years": years
        }
    except Exception as e:
        logger.error(f"Error in payment plan calculation: {str(e)}")
        raise

def get_country_info(country_name):
    """Get debt information for a specific country"""
    try:
        country = next((c for c in debt_data["countries"] if c["name"].lower() == country_name.lower()), None)
        if country:
            return {
                "name": country["name"],
                "debt_gdp": country["debt_gdp"],
                "debt_usd": country["debt_usd"],
                "debt_usd_formatted": f"${country['debt_usd']/1e12:.2f} trillion"
            }
        return None
    except Exception as e:
        logger.error(f"Error getting country info: {str(e)}")
        return None

def get_global_stats():
    """Calculate global debt statistics"""
    try:
        total_debt = sum(country["debt_usd"] for country in debt_data["countries"])
        avg_debt_gdp = np.mean([country["debt_gdp"] for country in debt_data["countries"]])
        highest_debt = max(debt_data["countries"], key=lambda x: x["debt_gdp"])
        lowest_debt = min(debt_data["countries"], key=lambda x: x["debt_gdp"])
        
        return {
            "total_debt": f"${total_debt/1e12:.2f} trillion",
            "average_debt_gdp": f"{avg_debt_gdp:.2f}%",
            "highest_debt": {
                "country": highest_debt["name"],
                "ratio": f"{highest_debt['debt_gdp']}%"
            },
            "lowest_debt": {
                "country": lowest_debt["name"],
                "ratio": f"{lowest_debt['debt_gdp']}%"
            }
        }
    except Exception as e:
        logger.error(f"Error calculating global stats: {str(e)}")
        raise

def process_query(query):
    """Process user query and generate appropriate response"""
    try:
        query = preprocess_text(query)
        
        # Check for payment plan request
        if any(word in query for word in ["payment", "repay", "plan", "monthly"]):
            numbers = re.findall(r'\d+', query)
            if len(numbers) >= 2:
                try:
                    principal = float(numbers[0]) * 1000
                    interest_rate = float(numbers[1])
                    years = float(numbers[2]) if len(numbers) > 2 else 10
                    plan = calculate_payment_plan(principal, interest_rate, years)
                    return {
                        "type": "payment_plan",
                        "data": plan,
                        "message": f"Here's your payment plan:\n\n" +
                                  f"💰 Monthly Payment: ${plan['monthly_payment']}\n" +
                                  f"💵 Total Interest: ${plan['total_interest']}\n" +
                                  f"💸 Total Payment: ${plan['total_payment']}\n" +
                                  f"⏱️ Term: {years} years"
                    }
                except ValueError as e:
                    return {
                        "type": "error",
                        "message": "Please provide valid numbers for the payment plan calculation."
                    }
            return {
                "type": "payment_plan_request",
                "message": knowledge_base["payment_plan"][0]
            }
        
        # Check for country-specific query
        for country in debt_data["countries"]:
            if country["name"].lower() in query:
                info = get_country_info(country["name"])
                if info:
                    return {
                        "type": "country_info",
                        "data": info,
                        "message": f"Here's the debt information for {info['name']}:\n\n" +
                                  f"📊 Debt-to-GDP Ratio: {info['debt_gdp']}%\n" +
                                  f"💰 Total Debt: {info['debt_usd_formatted']}"
                    }
        
        # Check for global statistics
        if any(word in query for word in ["global", "total", "average", "highest", "lowest"]):
            stats = get_global_stats()
            return {
                "type": "global_stats",
                "data": stats,
                "message": f"Global Debt Statistics:\n\n" +
                          f"🌍 Total Global Debt: {stats['total_debt']}\n" +
                          f"📊 Average Debt-to-GDP: {stats['average_debt_gdp']}\n" +
                          f"⬆️ Highest Debt: {stats['highest_debt']['country']} ({stats['highest_debt']['ratio']})\n" +
                          f"⬇️ Lowest Debt: {stats['lowest_debt']['country']} ({stats['lowest_debt']['ratio']})"
            }
        
        # Check for greeting or capabilities
        if any(word in query for word in ["hello", "hi", "hey", "help"]):
            return {
                "type": "greeting",
                "message": knowledge_base["greeting"][0]
            }
        
        # Default response
        return {
            "type": "error",
            "message": knowledge_base["error"][0]
        }
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return {
            "type": "error",
            "message": "I encountered an error processing your request. Please try again."
        }

@app.route('/api/chat', methods=['POST'])
@rate_limit
def chat():
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        data = request.json
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
        
        query = data.get('message', '')
        if not query or not isinstance(query, str):
            return jsonify({"error": "Invalid message format"}), 400
        
        response = process_query(query)
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, port=port) 