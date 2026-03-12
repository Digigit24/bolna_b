from django.urls import path

from analytics import views

app_name = "analytics"

urlpatterns = [
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),
    path("calls/", views.CallAnalyticsView.as_view(), name="call-analytics"),
]
