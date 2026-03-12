from django.urls import path

from interviews import views

app_name = "interviews"

urlpatterns = [
    path("", views.InterviewListCreateView.as_view(), name="interview-list-create"),
    path("<uuid:pk>/", views.InterviewDetailView.as_view(), name="interview-detail"),
]
