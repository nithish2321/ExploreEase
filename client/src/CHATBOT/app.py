from flask import Flask, render_template, request, jsonify
import json
from difflib import get_close_matches

app = Flask(__name__, template_folder='templates')

def load_knowledge_base(file_path:str) -> dict: 
    with open(file_path,'r') as file:
        data: dict = json.load(file)
    return data

def save_knowledge_base(file_path:str,data:dict):
    with open(file_path,'w') as file:
        json.dump(data,file, indent=2)

def find_best_match(user_question: str, question: list[str]) -> str| None:
    matches: list = get_close_matches(user_question, question, n=1, cutoff=0.6)
    return matches[0] if matches else None

def get_answer_for_question(question: str, knowledge_base: dict) -> str | None :
    for q in knowledge_base["questions"]:
        if q["question"] == question:
            return q["answer"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_answer', methods=['POST'])
def get_answer():
    user_input = request.form['user_input']
    knowledge_base = load_knowledge_base("knowledge_base.json")
    best_match = find_best_match(user_input, [q["question"] for q in knowledge_base["questions"]])
    if best_match:
        answer = get_answer_for_question(best_match, knowledge_base)
        return jsonify({'bot_response': answer})
    else:
        return jsonify({'bot_response': 'I Can\'t able to uderstand.'})

@app.route('/teach', methods=['POST'])
def teach():
    user_input = request.form['user_input']
    if user_input.lower() != 'skip':
        new_answer = request.form['new_answer']
        knowledge_base = load_knowledge_base("knowledge_base.json")
        knowledge_base["questions"].append({"question": user_input, "answer": new_answer})
        save_knowledge_base("knowledge_base.json", knowledge_base)
        return jsonify({'bot_response': 'Thank you! I learned a new response!'})
    else:
        return jsonify({'bot_response': 'Okay, I\'ll skip learning this time.'})

if __name__ == '__main__':
    app.run(debug=True)
