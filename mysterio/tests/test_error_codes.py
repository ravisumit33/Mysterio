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

    responses = [
        {
            "status_code": 400,
            "template": "400.html",
            "user_message": "Bad request",
        },
        {
            "status_code": 403,
            "template": "403.html",
            "user_message": "Permission denied",
        },
        {
            "status_code": 404,
            "template": "404.html",
            "user_message": "Page not found",
        },
        {
            "status_code": 500,
            "template": "500.html",
            "user_message": "Internal server error",
        },
    ]

    def test_correct_html_rendered_on_error_code(self):
        """Test if correct template and error code exists in response after http errors"""
        for expected_response in self.responses:
            with self.subTest(status_code=expected_response["status_code"]):
                client_response = self.client.get(
                    "/" + str(expected_response["status_code"]) + "/"
                )
                self.assertTemplateUsed(client_response, expected_response["template"])
                self.assertContains(
                    client_response,
                    expected_response["user_message"],
                    status_code=expected_response["status_code"],
                    html=True,
                )
