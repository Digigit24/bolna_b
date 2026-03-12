"""
Service for processing and storing call transcripts.

Responsibilities:
  - Parse raw transcript text into structured format
  - Upload transcript to S3/MinIO for archival
  - Extract key conversation data points
"""

import logging

import boto3
from django.conf import settings

logger = logging.getLogger("calls")


class TranscriptService:
    """Handles transcript processing and storage."""

    def __init__(self):
        self.bucket = settings.AWS_STORAGE_BUCKET_NAME
        self._s3_client = None

    @property
    def s3(self):
        """Lazy-init S3 client."""
        if self._s3_client is None:
            kwargs = {
                "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
                "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
                "region_name": settings.AWS_S3_REGION_NAME,
            }
            if settings.AWS_S3_ENDPOINT_URL:
                kwargs["endpoint_url"] = settings.AWS_S3_ENDPOINT_URL
            self._s3_client = boto3.client("s3", **kwargs)
        return self._s3_client

    def store_transcript(self, call_id: str, transcript: str) -> str:
        """
        Upload transcript text to S3 and return the object URL.

        Args:
            call_id:    CandidateCall UUID (used as file name)
            transcript: Raw transcript text

        Returns:
            S3 URL of the stored transcript
        """
        key = f"transcripts/{call_id}.txt"
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=transcript.encode("utf-8"),
            ContentType="text/plain",
        )
        url = f"s3://{self.bucket}/{key}"
        logger.info("Transcript stored: %s", url)
        return url

    def parse_transcript(self, raw_transcript: str) -> list[dict]:
        """
        Parse raw transcript into structured turns.

        Returns:
            List of dicts like [{"speaker": "Agent", "text": "Hello..."}, ...]
        """
        turns = []
        for line in raw_transcript.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            # Bolna transcripts typically use "Agent: ..." / "User: ..." format
            if ": " in line:
                speaker, text = line.split(": ", 1)
                turns.append({"speaker": speaker.strip(), "text": text.strip()})
            else:
                turns.append({"speaker": "unknown", "text": line})
        return turns

    def extract_key_info(self, transcript: str) -> dict:
        """
        Extract basic data points from a transcript.

        Returns dict with keys like:
            word_count, turn_count, agent_talk_ratio, user_talk_ratio
        """
        turns = self.parse_transcript(transcript)
        agent_words = sum(
            len(t["text"].split()) for t in turns if t["speaker"].lower() == "agent"
        )
        user_words = sum(
            len(t["text"].split()) for t in turns if t["speaker"].lower() != "agent"
        )
        total = agent_words + user_words or 1
        return {
            "word_count": total,
            "turn_count": len(turns),
            "agent_talk_ratio": round(agent_words / total, 2),
            "user_talk_ratio": round(user_words / total, 2),
        }
