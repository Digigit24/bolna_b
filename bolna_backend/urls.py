"""
Root URL configuration for bolna_backend project.

Routes all /api/ traffic to the bolna_wrapper app.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("bolna_wrapper.urls")),
]
