from unittest.mock import patch
from django.test import TestCase
from django.template.loader import get_template
from django.template.exceptions import TemplateDoesNotExist

class FrontendViewTests(TestCase):
    """Tests for frontend view
    """
    def test_index_page_200(self):
        """Test if index page is rendered with status code 200
        """
        try:
            get_template('index.html')
            response = self.client.get('/')
            self.assertEqual(response.status_code, 200)
            self.assertTemplateUsed(response, 'index.html')
        except TemplateDoesNotExist:
            self.skipTest("Skipping test as frontend is not built")


    @patch('mysterio.views.get_template', side_effect=TemplateDoesNotExist('index.html'))
    def test_index_page_404(self, mock_get_template): # pylint:disable=W0613
        """Test if 404 returned if index page not available
        """
        response = self.client.get('/')
        self.assertEqual(response.status_code, 404)
