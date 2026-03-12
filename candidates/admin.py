from django.contrib import admin

from candidates.models import Candidate


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ["name", "phone", "job", "status", "experience_years", "created_at"]
    list_filter = ["status", "organization"]
    search_fields = ["name", "email", "phone"]
