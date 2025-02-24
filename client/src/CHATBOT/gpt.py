from transformers import GPT2Tokenizer, GPT2Model
import torch

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2Model.from_pretrained("gpt2")

def get_closest_match_gpt(question: str, knowledge_base: dict) -> str | None:
    closest_match = None
    highest_similarity = -1

    for q in knowledge_base["questions"]:
        similarity_score = calculate_similarity(question, q["question"])
        if similarity_score > highest_similarity:
            closest_match = q["question"]
            highest_similarity = similarity_score

    return closest_match

def calculate_similarity(input_str: str, compare_str: str) -> float:
    inputs = tokenizer([input_str], return_tensors="pt", padding=True, truncation=True, max_length=64)
    compares = tokenizer([compare_str], return_tensors="pt", padding=True, truncation=True, max_length=64)

    with torch.no_grad():
        inputs_output = model(**inputs).last_hidden_state.mean(dim=1)
        compares_output = model(**compares).last_hidden_state.mean(dim=1)

    cosine_similarity = torch.nn.functional.cosine_similarity(inputs_output, compares_output).item()
    return cosine_similarity

def get_answer_for_question(question: str, knowledge_base: dict) -> str | None :
    best_match = get_closest_match_gpt(question, knowledge_base)
    if best_match:
        for q in knowledge_base["questions"]:
            if q["question"] == best_match:
                return q["answer"]
    return None
