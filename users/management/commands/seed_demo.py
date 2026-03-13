"""
Management command to seed the database with demo data for client presentations.

Usage:
    python manage.py seed_demo

Creates:
  - 1 Organization ("Demo Corp")
  - 1 Admin user (admin/admin123)
  - 3 Job postings
  - 8 Candidates across jobs
  - 5 Completed calls with transcripts & AI scores
  - 3 Scheduled interviews

Safe to run multiple times — checks for existing data before creating.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import uuid


class Command(BaseCommand):
    help = "Seed the database with demo data for client presentations"

    def handle(self, *args, **options):
        from organizations.models import Organization
        from users.models import User
        from jobs.models import Job
        from candidates.models import Candidate
        from calls.models import CandidateCall
        from interviews.models import Interview
        from rest_framework.authtoken.models import Token

        # Organization
        org, created = Organization.objects.get_or_create(
            slug="demo-corp",
            defaults={"name": "Demo Corp"},
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created organization: {org.name}"))
        else:
            self.stdout.write(f"Organization already exists: {org.name}")

        # Admin user
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@democorp.com",
                "first_name": "Alex",
                "last_name": "Morgan",
                "role": "admin",
                "organization": org,
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: admin / admin123"))
        else:
            # Ensure org is set
            if not admin.organization:
                admin.organization = org
                admin.save()
                self.stdout.write("Updated admin user with organization")
            self.stdout.write(f"Admin user already exists: {admin.username}")

        Token.objects.get_or_create(user=admin)

        # Skip if demo data already seeded
        if Job.objects.filter(organization=org).count() >= 3:
            self.stdout.write(self.style.WARNING("Demo data already exists. Skipping."))
            return

        # Jobs
        now = timezone.now()
        jobs_data = [
            {"title": "Senior Python Developer", "description": "Build and maintain backend services using Django and FastAPI. Lead microservice architecture design.", "requirements": "5+ years Python, Django/FastAPI experience, PostgreSQL, Redis, Docker", "location": "Remote"},
            {"title": "React Frontend Engineer", "description": "Build modern responsive UIs with React, TypeScript, and Tailwind CSS. Collaborate closely with product and design teams.", "requirements": "3+ years React, TypeScript, Tailwind CSS, REST APIs", "location": "New York, NY"},
            {"title": "DevOps Engineer", "description": "Manage CI/CD pipelines, container orchestration with Kubernetes, and cloud infrastructure on AWS.", "requirements": "3+ years DevOps, Kubernetes, Terraform, AWS/GCP, GitHub Actions", "location": "San Francisco, CA"},
        ]
        jobs = []
        for jd in jobs_data:
            job = Job.objects.create(organization=org, created_by=admin, **jd)
            jobs.append(job)
            self.stdout.write(self.style.SUCCESS(f"  Created job: {job.title}"))

        # Candidates
        candidates_data = [
            {"name": "Sarah Chen", "phone": "+14155551001", "email": "sarah.chen@email.com", "experience_years": 7, "skills": ["Python", "Django", "PostgreSQL", "Docker", "Redis"], "job": jobs[0], "status": "qualified"},
            {"name": "James Wilson", "phone": "+14155551002", "email": "james.wilson@email.com", "experience_years": 5, "skills": ["Python", "FastAPI", "AWS", "Celery"], "job": jobs[0], "status": "screening"},
            {"name": "Emily Rodriguez", "phone": "+14155551003", "email": "emily.r@email.com", "experience_years": 4, "skills": ["React", "TypeScript", "Next.js", "Tailwind"], "job": jobs[1], "status": "qualified"},
            {"name": "Michael Park", "phone": "+14155551004", "email": "m.park@email.com", "experience_years": 3, "skills": ["React", "JavaScript", "CSS", "Node.js"], "job": jobs[1], "status": "new"},
            {"name": "Lisa Thompson", "phone": "+14155551005", "email": "lisa.t@email.com", "experience_years": 6, "skills": ["Kubernetes", "Terraform", "AWS", "Docker", "CI/CD"], "job": jobs[2], "status": "qualified"},
            {"name": "David Kim", "phone": "+14155551006", "email": "david.kim@email.com", "experience_years": 8, "skills": ["Python", "Django", "React", "PostgreSQL"], "job": jobs[0], "status": "hired"},
            {"name": "Anna Martinez", "phone": "+14155551007", "email": "anna.m@email.com", "experience_years": 2, "skills": ["React", "Vue.js", "CSS"], "job": jobs[1], "status": "rejected"},
            {"name": "Robert Johnson", "phone": "+14155551008", "email": "r.johnson@email.com", "experience_years": 5, "skills": ["AWS", "GCP", "Kubernetes", "Terraform"], "job": jobs[2], "status": "screening"},
        ]
        candidates = []
        for cd in candidates_data:
            job = cd.pop("job")
            candidate = Candidate.objects.create(organization=org, job=job, **cd)
            candidates.append(candidate)
        self.stdout.write(self.style.SUCCESS(f"  Created {len(candidates)} candidates"))

        # Calls (completed with transcripts)
        calls_data = [
            {"candidate": candidates[0], "status": "completed", "duration": 342, "ai_score": 87.5,
             "transcript": "Interviewer: Tell me about your experience with Django.\nCandidate: I've been working with Django for over 5 years, building large-scale applications including REST APIs and background task processing with Celery.\nInterviewer: What about database optimization?\nCandidate: I've extensively worked with PostgreSQL, implementing query optimization, indexing strategies, and database migrations for high-traffic applications.\nInterviewer: Can you describe a challenging project?\nCandidate: I led the migration of a monolithic Django application to microservices architecture, which improved our deployment frequency by 10x.",
             "summary": "Strong candidate with 7 years of Python/Django experience. Demonstrated deep knowledge of database optimization and microservice architecture. Excellent communication skills. Recommended for technical interview."},
            {"candidate": candidates[1], "status": "completed", "duration": 256, "ai_score": 62.0,
             "transcript": "Interviewer: What's your experience with Python?\nCandidate: I've been using Python for about 5 years, mainly with FastAPI.\nInterviewer: Have you worked with Django?\nCandidate: Not extensively, but I'm familiar with the framework basics.\nInterviewer: Tell me about your AWS experience.\nCandidate: I've deployed applications to EC2 and used S3 for storage.",
             "summary": "Decent candidate with good Python skills but limited Django experience. AWS knowledge is basic. May need training on Django-specific patterns. Consider for junior position."},
            {"candidate": candidates[2], "status": "completed", "duration": 412, "ai_score": 91.2,
             "transcript": "Interviewer: Tell me about your React experience.\nCandidate: I've been building React applications for 4 years, including complex SPAs with TypeScript. I'm very experienced with Next.js for server-side rendering.\nInterviewer: How do you handle state management?\nCandidate: I prefer Zustand for simple state and TanStack Query for server state. I've also used Redux for larger applications.\nInterviewer: What about testing?\nCandidate: I write unit tests with Vitest and integration tests with Playwright. I aim for 80%+ coverage.",
             "summary": "Excellent frontend candidate with strong React/TypeScript expertise. Modern tooling knowledge (Next.js, Zustand, TanStack Query). Strong testing practices. Highly recommended for technical interview."},
            {"candidate": candidates[4], "status": "completed", "duration": 298, "ai_score": 78.5,
             "transcript": "Interviewer: Describe your Kubernetes experience.\nCandidate: I've managed production Kubernetes clusters on AWS EKS for 3 years. I handle deployments, scaling, and monitoring.\nInterviewer: What about infrastructure as code?\nCandidate: I use Terraform extensively for provisioning cloud resources. All our infrastructure is version-controlled.\nInterviewer: How do you handle CI/CD?\nCandidate: We use GitHub Actions with ArgoCD for GitOps-style deployments.",
             "summary": "Solid DevOps candidate with strong Kubernetes and Terraform skills. Good understanding of GitOps practices. Should perform well in the role."},
            {"candidate": candidates[5], "status": "completed", "duration": 380, "ai_score": 95.0,
             "transcript": "Interviewer: Tell me about your full-stack experience.\nCandidate: I have 8 years of experience building full-stack applications with Python/Django on the backend and React on the frontend. I've led teams of 5-8 developers.\nInterviewer: What's your approach to architecture?\nCandidate: I believe in clean architecture with clear separation of concerns. I use DDD patterns and ensure comprehensive test coverage.\nInterviewer: Any experience with scaling?\nCandidate: Yes, I've scaled applications to handle millions of requests per day using caching, CDNs, and horizontal scaling.",
             "summary": "Outstanding candidate with 8 years of full-stack experience. Strong leadership and architecture skills. Deep understanding of scaling patterns. Hired for Senior Python Developer role."},
        ]
        for cd in calls_data:
            cd["bolna_call_id"] = f"demo_{uuid.uuid4().hex[:12]}"
            CandidateCall.objects.create(**cd)
        self.stdout.write(self.style.SUCCESS(f"  Created {len(calls_data)} call records"))

        # Failed/queued calls
        CandidateCall.objects.create(
            candidate=candidates[3], status="failed", duration=0,
            error_message="Call not answered", bolna_call_id=f"demo_{uuid.uuid4().hex[:12]}",
        )
        CandidateCall.objects.create(
            candidate=candidates[6], status="completed", duration=180, ai_score=35.0,
            transcript="Short interview. Candidate lacks required experience.",
            summary="Candidate does not meet minimum requirements for the position. 2 years experience vs 3 required. Rejected.",
            bolna_call_id=f"demo_{uuid.uuid4().hex[:12]}",
        )
        self.stdout.write(self.style.SUCCESS("  Created additional call records"))

        # Interviews
        Interview.objects.create(
            candidate=candidates[0], job=jobs[0],
            interview_type="technical", status="scheduled",
            scheduled_at=now + timedelta(days=2), interviewer=admin,
        )
        Interview.objects.create(
            candidate=candidates[2], job=jobs[1],
            interview_type="technical", status="scheduled",
            scheduled_at=now + timedelta(days=3), interviewer=admin,
        )
        Interview.objects.create(
            candidate=candidates[4], job=jobs[2],
            interview_type="hr", status="completed",
            scheduled_at=now - timedelta(days=1), interviewer=admin,
            rating=8, feedback="Strong candidate, good cultural fit.",
        )
        self.stdout.write(self.style.SUCCESS("  Created 3 interviews"))

        self.stdout.write(self.style.SUCCESS("\nDemo data seeded successfully!"))
        self.stdout.write(f"  Login: admin / admin123")
        self.stdout.write(f"  Organization: {org.name}")
