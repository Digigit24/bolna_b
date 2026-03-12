"""
Analytics API views — provide dashboard metrics for recruiters.

Metrics:
  - calls_today, calls_this_week
  - calls_connected (completed)
  - qualified_candidates
  - avg_call_duration
  - avg_ai_score
  - candidate pipeline by status
  - calls by status breakdown
"""

import logging
from datetime import timedelta

from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from calls.models import CandidateCall
from candidates.models import Candidate
from jobs.models import Job

logger = logging.getLogger("calls")


class DashboardView(APIView):
    """
    GET /api/analytics/dashboard/

    Returns key metrics for the recruiter dashboard.
    All data is scoped to the user's organization.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.organization
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())

        # Call metrics
        org_calls = CandidateCall.objects.filter(candidate__organization=org)
        calls_today = org_calls.filter(created_at__gte=today_start).count()
        calls_this_week = org_calls.filter(created_at__gte=week_start).count()
        calls_total = org_calls.count()

        calls_connected = org_calls.filter(status=CandidateCall.Status.COMPLETED).count()
        calls_failed = org_calls.filter(status=CandidateCall.Status.FAILED).count()
        calls_queued = org_calls.filter(status=CandidateCall.Status.QUEUED).count()

        call_stats = org_calls.filter(
            status=CandidateCall.Status.COMPLETED,
        ).aggregate(
            avg_duration=Avg("duration"),
            avg_score=Avg("ai_score"),
            total_duration=Sum("duration"),
        )

        # Candidate metrics
        org_candidates = Candidate.objects.filter(organization=org)
        total_candidates = org_candidates.count()
        qualified_candidates = org_candidates.filter(
            status=Candidate.Status.QUALIFIED,
        ).count()

        # Pipeline breakdown
        pipeline = dict(
            org_candidates.values("status").annotate(count=Count("id")).values_list("status", "count")
        )

        # Job metrics
        active_jobs = Job.objects.filter(organization=org, status=Job.Status.OPEN).count()

        return Response({
            "calls": {
                "today": calls_today,
                "this_week": calls_this_week,
                "total": calls_total,
                "connected": calls_connected,
                "failed": calls_failed,
                "queued": calls_queued,
                "avg_duration": round(call_stats["avg_duration"] or 0, 1),
                "avg_ai_score": round(call_stats["avg_score"] or 0, 1),
                "total_duration": call_stats["total_duration"] or 0,
            },
            "candidates": {
                "total": total_candidates,
                "qualified": qualified_candidates,
                "pipeline": pipeline,
            },
            "jobs": {
                "active": active_jobs,
            },
        })


class CallAnalyticsView(APIView):
    """
    GET /api/analytics/calls/

    Detailed call analytics with daily breakdown.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.organization
        days = int(request.query_params.get("days", 7))
        now = timezone.now()
        start_date = now - timedelta(days=days)

        org_calls = CandidateCall.objects.filter(
            candidate__organization=org,
            created_at__gte=start_date,
        )

        # Daily breakdown
        daily = (
            org_calls
            .extra(select={"day": "DATE(created_at)"})
            .values("day")
            .annotate(
                total=Count("id"),
                completed=Count("id", filter=Q(status="completed")),
                failed=Count("id", filter=Q(status="failed")),
            )
            .order_by("day")
        )

        # Status breakdown
        by_status = dict(
            org_calls.values("status").annotate(count=Count("id")).values_list("status", "count")
        )

        return Response({
            "period_days": days,
            "daily": list(daily),
            "by_status": by_status,
            "total": org_calls.count(),
        })
