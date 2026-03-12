from django.urls import path

from webhooks import views

app_name = "webhooks"

urlpatterns = [
    path("bolna/", views.BolnaWebhookView.as_view(), name="bolna-webhook"),
]
