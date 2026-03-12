from django.contrib import admin

from interviews.models import Interview


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ["candidate", "interview_type", "status", "scheduled_at", "interviewer"]
    list_filter = ["status", "interview_type"]
