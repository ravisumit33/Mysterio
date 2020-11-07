import logging
from django.test import SimpleTestCase, override_settings
from django.http import Http404
from django.core.exceptions import SuspiciousOperation, PermissionDenied
from django.urls import path
from django.views.defaults import server_error


def http_400_view(request):
    """Test view for 400"""
    raise SuspiciousOperation


def http_403_view(request):
    """Test view for 403"""
    raise PermissionDenied


def http_404_view(request):
    """Test view for 404"""
    raise Http404


def http_500_view(request):
    """Test view for 500"""
    return server_error(request)


urlpatterns = [
    path("400/", http_400_view),
    path("403/", http_403_view),
    path("404/", http_404_view),
    path("500/", http_500_view),
]


@override_settings(ROOT_URLCONF=__name__)
class ErrorCodeHandlerTests(SimpleTestCase):
    """Tests for error code handlers"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        logging.disable(logging.NOTSET)

    status_codes = [400, 403, 404, 500]
    templates = ["400.html", "403.html", "404.html", "500.html"]
    user_messages = [
        "Bad request",
        "Permission denied",
        "Page not found",
        "Internal server error",
    ]

    def test_correct_html_rendered_on_error_code(self):
        """Test if correct template and error code exists in response after http errors"""
        for i in range(len(self.status_codes)):
            with self.subTest(i=i):
                response = self.client.get("/" + str(self.status_codes[i]) + "/")
                self.assertTemplateUsed(response, self.templates[i])
                self.assertContains(
                    response,
                    self.user_messages[i],
                    status_code=self.status_codes[i],
                    html=True,
                )
