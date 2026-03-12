from django.contrib import admin

from calls.models import CandidateCall


@admin.register(CandidateCall)
class CandidateCallAdmin(admin.ModelAdmin):
    list_display = [
        "candidate", "bolna_call_id", "status", "duration",
        "ai_score", "retry_count", "created_at",
    ]
    list_filter = ["status"]
    search_fields = ["candidate__name", "bolna_call_id"]
    readonly_fields = ["bolna_call_id", "transcript", "summary"]
