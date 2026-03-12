"""
URL routing for the bolna_wrapper app.

All paths are relative to /api/ (see bolna_backend/urls.py).
"""

from django.urls import path

from . import views

urlpatterns = [
    # Core call endpoints
    path("call-bolna/", views.CallBolnaView.as_view(), name="call-bolna"),
    path("start-call/", views.StartCallView.as_view(), name="start-call"),
    path("call-status/", views.CallStatusView.as_view(), name="call-status"),

    # Agent management endpoints
    path("agents/", views.ListAgentsView.as_view(), name="list-agents"),
    path("agents/create/", views.CreateAgentView.as_view(), name="create-agent"),
    path("agents/<str:agent_id>/", views.AgentDetailView.as_view(), name="agent-detail"),

    # Health check
    path("health/", views.HealthCheckView.as_view(), name="health-check"),
]
