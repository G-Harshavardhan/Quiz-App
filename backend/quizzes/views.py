from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Quiz, Question, AnswerChoice, QuizAttempt, UserAnswer
from .serializers import (
    QuizSerializer, QuizListSerializer, QuizAttemptSerializer,
    QuestionResultSerializer, QuizReviewSerializer
)
from .services import generate_quiz_via_ai

class GenerateQuizView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic')
        difficulty = request.data.get('difficulty', 'Medium')
        num_questions = request.data.get('num_questions', 5)

        if not topic:
            return Response({"error": "Topic is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quiz = generate_quiz_via_ai(request.user, topic, difficulty, int(num_questions))
            serializer = QuizSerializer(quiz)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class QuizDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk)
        
        # User can only view their own quizzes (for now)
        if quiz.user != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)

class SubmitAttemptView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        """
        Expects payload:
        {
            "answers": {
                "question_id_1": "choice_id_a",
                "question_id_2": "choice_id_b"
            }
        }
        """
        quiz = get_object_or_404(Quiz, pk=pk)
        
        if quiz.user != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        answers_data = request.data.get('answers', {})
        
        # Create attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user,
            completed_at=timezone.now()
        )

        score = 0
        total_questions = quiz.questions.count()

        for q_id, c_id in answers_data.items():
            try:
                question = quiz.questions.get(pk=q_id)
                choice = question.choices.get(pk=c_id)
                
                is_correct = choice.is_correct
                if is_correct:
                    score += 1
                    
                UserAnswer.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_choice=choice,
                    is_correct=is_correct
                )
            except (Question.DoesNotExist, AnswerChoice.DoesNotExist):
                continue
                
        # Finalize score percentage
        final_score = int((score / total_questions) * 100) if total_questions > 0 else 0
        attempt.score = final_score
        attempt.save()

        review_data = QuizReviewSerializer(quiz).data
        attempt_data = QuizAttemptSerializer(attempt).data

        return Response({
            "message": "Quiz submitted successfully.",
            "attempt_id": attempt.id,
            "score": score
        }, status=status.HTTP_201_CREATED)

class QuizHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        attempts = QuizAttempt.objects.filter(user=request.user).order_by('-completed_at')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    def delete(self, request):
        """Standard 'Clear All' functionality."""
        QuizAttempt.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DeleteAttemptView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        attempt = get_object_or_404(QuizAttempt, pk=pk, user=request.user)
        attempt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class QuizReviewView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        # pk here is Quiz ID, but let's allow finding by Attempt ID or Quiz ID
        # User wants to review 'A' specific attempt usually.
        # If we pass Quiz ID, find latest attempt.
        quiz = get_object_or_404(Quiz, pk=pk)
        
        # User can review their OWN quizzes or quizzes they have ATTEMPTED
        # Actually, let's just make it Attempt-based to be precise if they want to see THEIR score.
        attempt = QuizAttempt.objects.filter(quiz=quiz, user=request.user).order_by('-completed_at').first()
        
        return Response({
            "attempt": QuizAttemptSerializer(attempt).data,
            "review": QuizReviewSerializer(quiz).data
        })

class AttemptReviewView(views.APIView):
    """Explicitly review by Attempt ID."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        attempt = get_object_or_404(QuizAttempt, pk=pk, user=request.user)
        quiz = attempt.quiz


        return Response({
            "attempt": QuizAttemptSerializer(attempt).data,
            "review": QuizReviewSerializer(quiz).data
        })
