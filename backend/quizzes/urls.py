from django.urls import path
from . import views

urlpatterns = [
    path('generate', views.GenerateQuizView.as_view(), name='generate-quiz'),
    path('history', views.QuizHistoryView.as_view(), name='quiz-history'),
    path('attempts/<int:pk>', views.DeleteAttemptView.as_view(), name='delete-attempt'),
    path('attempts/<int:pk>/review', views.AttemptReviewView.as_view(), name='attempt-review'),
    path('<int:pk>', views.QuizDetailView.as_view(), name='quiz-detail'),
    path('<int:pk>/submit', views.SubmitAttemptView.as_view(), name='submit-attempt'),
    path('<int:pk>/review', views.QuizReviewView.as_view(), name='quiz-review'),
]
