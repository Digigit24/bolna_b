"""
Celery application for the bolna_backend project.

This configures Celery to use Django settings and auto-discover
tasks from all installed apps (e.g. calls/tasks.py).
"""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bolna_backend.settings")

app = Celery("bolna_backend")

# Read Celery config from Django settings, using the CELERY_ namespace.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in each installed app.
app.autodiscover_tasks()
