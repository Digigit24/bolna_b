"""
Service for generating AI summaries and candidate scores from call transcripts.

Responsibilities:
  - Analyze transcript content
  - Generate structured candidate evaluation
  - Produce a numeric score (0-100)
  - Extract: experience, skills, salary expectation, notice period, etc.

NOTE: This uses a placeholder scoring algorithm. Replace with your
preferred LLM integration (OpenAI, Claude, etc.) for production use.
"""

import logging

logger = logging.getLogger("calls")


class AISummaryService:
    """Generates AI-powered candidate summaries from call transcripts."""

    # Keywords that positively influence the score
    POSITIVE_SIGNALS = [
        "experience", "years", "worked", "built", "led", "managed",
        "delivered", "improved", "yes", "available", "interested",
        "skilled", "certified", "proficient",
    ]

    # Keywords that negatively influence the score
    NEGATIVE_SIGNALS = [
        "no experience", "not interested", "too far", "cannot",
        "declined", "unavailable", "not available",
    ]

    def generate_summary(self, transcript: str, candidate_name: str = "") -> dict:
        """
        Analyze the transcript and produce a candidate evaluation.

        Args:
            transcript:     Full call transcript text
            candidate_name: Name of the candidate (for summary text)

        Returns:
            {
                "ai_score": float (0-100),
                "summary": str,
                "extracted": {
                    "years_of_experience": str,
                    "salary_expectation": str,
                    "notice_period": str,
                    "skills_mentioned": list[str],
                    "communication_score": float,
                    "recommendation": str,
                }
            }
        """
        if not transcript:
            return {
                "ai_score": 0.0,
                "summary": "No transcript available for analysis.",
                "extracted": {},
            }

        transcript_lower = transcript.lower()
        words = transcript_lower.split()
        word_count = len(words)

        # --- Score calculation (placeholder — replace with LLM) ---
        base_score = min(50.0, word_count * 0.3)

        positive_hits = sum(
            1 for kw in self.POSITIVE_SIGNALS if kw in transcript_lower
        )
        negative_hits = sum(
            1 for kw in self.NEGATIVE_SIGNALS if kw in transcript_lower
        )

        score = base_score + (positive_hits * 5) - (negative_hits * 10)
        score = max(0.0, min(100.0, round(score, 1)))

        # --- Extract structured data (placeholder — replace with LLM) ---
        extracted = self._extract_fields(transcript_lower)

        # --- Recommendation ---
        if score >= 70:
            recommendation = "Recommended for technical interview"
        elif score >= 40:
            recommendation = "Consider for further screening"
        else:
            recommendation = "Does not meet minimum criteria"

        extracted["recommendation"] = recommendation
        extracted["communication_score"] = min(10.0, round(word_count * 0.05, 1))

        # --- Summary text ---
        summary = (
            f"Candidate: {candidate_name or 'Unknown'}\n"
            f"Score: {score}/100\n"
            f"Communication Score: {extracted['communication_score']}/10\n"
            f"Skills Mentioned: {', '.join(extracted.get('skills_mentioned', [])) or 'None detected'}\n"
            f"Recommendation: {recommendation}\n"
        )

        logger.info(
            "AI summary generated for %s: score=%.1f recommendation=%s",
            candidate_name,
            score,
            recommendation,
        )

        return {
            "ai_score": score,
            "summary": summary,
            "extracted": extracted,
        }

    def _extract_fields(self, transcript_lower: str) -> dict:
        """
        Basic keyword extraction from transcript.
        Replace this with LLM-based extraction for production.
        """
        # Detect commonly mentioned skills
        tech_skills = [
            "python", "django", "react", "javascript", "nodejs", "java",
            "aws", "docker", "kubernetes", "sql", "mongodb", "typescript",
            "golang", "rust", "flask", "fastapi", "angular", "vue",
        ]
        found_skills = [s for s in tech_skills if s in transcript_lower]

        return {
            "years_of_experience": "Not extracted (requires LLM)",
            "salary_expectation": "Not extracted (requires LLM)",
            "notice_period": "Not extracted (requires LLM)",
            "skills_mentioned": found_skills,
        }
