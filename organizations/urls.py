from django.urls import path

from organizations import views

app_name = "organizations"

urlpatterns = [
    path("", views.OrganizationListCreateView.as_view(), name="org-list-create"),
    path("<uuid:pk>/", views.OrganizationDetailView.as_view(), name="org-detail"),
]
