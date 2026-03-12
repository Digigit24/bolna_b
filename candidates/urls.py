from django.urls import path

from candidates import views

app_name = "candidates"

urlpatterns = [
    path("", views.CandidateListCreateView.as_view(), name="candidate-list-create"),
    path("bulk/", views.CandidateBulkCreateView.as_view(), name="candidate-bulk-create"),
    path("<uuid:pk>/", views.CandidateDetailView.as_view(), name="candidate-detail"),
]
