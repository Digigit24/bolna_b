from django.urls import path

from calls import views

app_name = "calls"

urlpatterns = [
    path("", views.CallListView.as_view(), name="call-list"),
    path("start/", views.StartCallView.as_view(), name="start-call"),
    path("<uuid:pk>/", views.CallDetailView.as_view(), name="call-detail"),
    path("<uuid:pk>/transcript/", views.CallTranscriptView.as_view(), name="call-transcript"),
]
