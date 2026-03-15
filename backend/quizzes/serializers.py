from rest_framework import serializers
from .models import Quiz, Question, AnswerChoice, QuizAttempt, UserAnswer

class AnswerChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerChoice
        fields = ['id', 'text']  # Exclude 'is_correct' for taking the quiz safely

class AnswerChoiceResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerChoice
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = AnswerChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'choices']

class QuestionResultSerializer(serializers.ModelSerializer):
    choices = AnswerChoiceResultSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'choices']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'topic', 'difficulty', 'num_questions', 'created_at', 'questions']

class QuizListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'topic', 'difficulty', 'num_questions', 'created_at']

class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = ['question', 'selected_choice', 'is_correct']

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz = QuizListSerializer(read_only=True)
    user_answers = UserAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'score', 'started_at', 'completed_at', 'user_answers']
class QuizReviewSerializer(serializers.ModelSerializer):
    questions = QuestionResultSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'topic', 'difficulty', 'num_questions', 'questions']
