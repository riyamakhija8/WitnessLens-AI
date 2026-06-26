import unittest
from fastapi.testclient import TestClient

from app.main import app


class UploadEndpointTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_upload_returns_structured_json_for_invalid_pdf(self) -> None:
        response = self.client.post(
            "/upload",
            files={"file": ("bad.txt", b"not-a-pdf", "text/plain")},
        )

        self.assertEqual(response.status_code, 422)
        payload = response.json()
        self.assertIn("success", payload)
        self.assertFalse(payload["success"])
        self.assertIn("error", payload)


if __name__ == "__main__":
    unittest.main()
