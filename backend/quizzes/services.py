import json
from django.conf import settings
from groq import Groq
from .models import Quiz, Question, AnswerChoice

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_quiz_via_ai(user, topic, difficulty, num_questions):
    """
    Calls the Groq API (Llama3) to generate a multiple-choice quiz and 
    saves it structured into the PostgreSQL database.
    """
    prompt = f"""
    You are an expert quiz generator. Generate a multiple-choice quiz about "{topic}".
    Complexity: {difficulty}.
    Total Questions: {num_questions}.

    STRICT REQUIREMENTS:
    1. Every question MUST have exactly 4 choices.
    2. Exactly ONE choice must be "is_correct": true.
    3. Three choices must be "is_correct": false.
    4. NO repeat questions. Ensure questions are unique, creative, and novel even for common topics.
    5. NO repeating answer options within a question.
    6. Ensure the question text is complete and doesn't contain the next question inside it.
    7. Generate exactly {num_questions} questions.
    8. Focus on different sub-topics and facts to avoid repeating previous set of questions if this topic was requested before.

    JSON SCHEMA:
    {{
        "questions": [
            {{
                "text": "Question content?",
                "choices": [
                    {{"text": "Option A", "is_correct": true}},
                    {{"text": "Option B", "is_correct": false}},
                    {{"text": "Option C", "is_correct": false}},
                    {{"text": "Option D", "is_correct": false}}
                ]
            }}
        ]
    }}
    """

    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a professional educational content generator. Output ONLY raw, valid JSON matching the schema precisely.",
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.8,
        response_format={"type": "json_object"}
    )

    try:
        content = response.choices[0].message.content
        
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            raise ValueError("AI returned an invalid JSON format. Please try again.")

        if not data.get("questions"):
            raise ValueError("AI failed to generate any questions. Please try again.")
        
        # 1. Create the Quiz record
        quiz = Quiz.objects.create(
            user=user,
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions
        )

        # 2. Add Questions and Choices
        for q_index, q_data in enumerate(data.get("questions", [])):
            question = Question.objects.create(
                quiz=quiz,
                text=q_data.get("text", "Untitled Question"),
                order=q_index
            )
            for c_data in q_data.get("choices", []):
                AnswerChoice.objects.create(
                    question=question,
                    text=c_data.get("text", "No option text provided"),
                    is_correct=c_data.get("is_correct", False)
                )

        return quiz
    except Exception:
        raise
