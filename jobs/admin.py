from django.contrib import admin

from jobs.models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["title", "organization", "status", "created_by", "created_at"]
    list_filter = ["status", "organization"]
    search_fields = ["title", "description"]
