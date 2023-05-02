import logging
from unittest.mock import patch

from django.template.exceptions import TemplateDoesNotExist
from django.template.loader import get_template
from django.test import TestCase


class FrontendViewTests(TestCase):
    """Tests for frontend view"""

    def test_index_page_200(self):
        """Test if index page is rendered with status code 200"""
        get_template("index.html")
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "index.html")

    @patch("core.views.get_template", side_effect=TemplateDoesNotExist("index.html"))
    def test_index_page_404(self, mock_get_template):
        """Test if 404 returned if index page not available"""
        logging.disable(logging.CRITICAL)
        response = self.client.get("/")
        self.assertEqual(response.status_code, 404)
        logging.disable(logging.NOTSET)
