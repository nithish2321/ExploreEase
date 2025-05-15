from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from transformers import pipeline
import re

app = Flask(__name__)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["test"]
tours_collection = db["tours"]

# Initialize LLM for question-answering
llm = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

def is_price_query(user_input):
    """Check if the user input is asking for a tour price."""
    price_keywords = [
        r"price\s+of", r"cost\s+of", r"how\s+much\s+is", r"tour\s+price",
        r"how\s+much\s+price\s+for", r"what\s+is\s+the\s+price\s+of", r"price\s+for",
        r"provide\s+the\s+price\s+of"
    ]
    return any(re.search(pattern, user_input.lower()) for pattern in price_keywords)

def is_list_all_tours_query(user_input):
    """Check if the user input is asking to list all tours."""
    list_all_patterns = [
        r"list\s+(all|every)\s+tours?",
        r"list\s+out\s+(all|every)?\s*tours?(?:\s+title)?",
        r"show\s+(all|every)\s+tours?(?:\s+title)?",
        r"get\s+(all|every)\s+tours?(?:\s+title)?"
    ]
    return any(re.search(pattern, user_input.lower()) for pattern in list_all_patterns)

def is_tour_query(user_input):
    """Check if the user input is related to tours."""
    tour_keywords = ["tour", "tours", "travel", "trip", "jammu", "kashmir", "srinagar", "dal lake", "himachal"]
    return any(keyword in user_input.lower() for keyword in tour_keywords) or is_price_query(user_input) or is_list_all_tours_query(user_input)

def extract_tour_name(user_input):
    """Extract the tour name from the user input."""
    user_input = user_input.lower()
    # Remove price-related phrases but preserve the tour title
    patterns = [
        r"price\s+of", r"cost\s+of", r"how\s+much\s+is", r"tour\s+price",
        r"how\s+much\s+price\s+for", r"what\s+is\s+the\s+price\s+of", r"price\s+for",
        r"provide\s+the\s+price\s+of"
    ]
    for pattern in patterns:
        user_input = re.sub(pattern, "", user_input)
    # Remove standalone 'tour' but not as part of the title
    user_input = re.sub(r"\btour\b", "", user_input)
    # Clean up extra spaces
    return " ".join(user_input.split())

def query_tour_price(user_input):
    """Query the 'tours' collection for a tour's price."""
    tour_name = extract_tour_name(user_input)
    try:
        # Split the tour name into words and join with optional 'the' between words
        words = tour_name.split()
        # Create a regex pattern that makes 'the' optional between words
        regex_pattern = r"\s*".join(words)  # Match words with any spacing
        regex_pattern = regex_pattern.replace(r"\s*of\s*", r"\s*(?:the\s*)?of\s*(?:the\s*)?")  # Make 'the' optional around 'of'
        print(f"Searching for tour with regex pattern: {regex_pattern}")
        tour = tours_collection.find_one({"title": {"$regex": regex_pattern, "$options": "i"}})
        if tour and "price" in tour:
            return f"₹{tour['price']} for {tour['title']}"
        return f"No tour found matching '{tour_name}'."
    except Exception as e:
        return f"Error querying tours: {str(e)}"

def query_tours(user_input):
    """Query the 'tours' collection for tour details."""
    try:
        tours = []
        if is_list_all_tours_query(user_input):
            total_tours = tours_collection.count_documents({})
            print(f"Total tours in collection: {total_tours}")
            results = tours_collection.find({})
            if "title" in user_input.lower():
                titles = [tour['title'] for tour in results if 'title' in tour]
                return "\n".join(titles) if titles else "No tour titles found in the 'tours' collection."
        else:
            query = {"$or": [
                {"title": {"$regex": user_input, "$options": "i"}},
                {"city": {"$regex": user_input, "$options": "i"}}
            ]}
            results = tours_collection.find(query)
        
        for tour in results:
            tour_info = (
                f"**Title**: {tour['title']}\n"
                f"**City**: {tour['city']}\n"
                f"**Address**: {tour['address']}\n"
                f"**Distance**: {tour['distance']} km\n"
                f"**Price**: ₹{tour['price']}\n"
                f"**Max Group Size**: {tour['maxGroupSize']}\n"
                f"**Description**: {tour['desc']}"
            )
            tours.append(tour_info)
        
        return "\n\n".join(tours) if tours else "No tours found in the 'tours' collection."
    except Exception as e:
        return f"Error querying tours: {str(e)}"

def llm_response(user_input):
    """Generate a response using the LLM for general questions."""
    context = "I am a helpful chatbot that can answer general questions and provide information about tours."
    try:
        if is_tour_query(user_input):
            return "Please specify a tour name or try 'list all tours' to see available tours."
        result = llm(question=user_input, context=context)
        return result["answer"]
    except Exception as e:
        return f"Sorry, I couldn't process that question: {str(e)}"

def chatbot_response(user_input):
    """Handle user input and return a response."""
    responses = {
        "hello": "Hi there! How can I assist you?",
        "how are you": "I'm just a bot, but I'm here to help!",
        "bye": "Goodbye! Have a great day!",
        "hii": "Hi there! How can I assist you?"
    }
    
    user_input_lower = user_input.lower().strip()
    
    if user_input_lower in responses:
        return responses[user_input_lower]
    
    if is_price_query(user_input):
        return query_tour_price(user_input)
    
    if is_tour_query(user_input):
        return query_tours(user_input)
    
    return llm_response(user_input)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_answer", methods=["POST"])
def get_answer():
    user_input = request.form.get("user_input")
    bot_response = chatbot_response(user_input)
    return jsonify({"bot_response": bot_response})

if __name__ == "__main__":
    app.run(debug=True)