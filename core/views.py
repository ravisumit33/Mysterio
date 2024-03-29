import logging
from django.views.generic.base import TemplateView
from django.template.exceptions import TemplateDoesNotExist
from django.http import Http404
from django.template.loader import get_template

logger = logging.getLogger(__name__)


class FrontendView(TemplateView):
    """Frontend View
    Inherits django.views.generic.base.TemplateView to render index.html
    from Frontend App
    """

    template_name = "index.html"

    def get(self, request, *args, **kwargs):
        try:
            get_template(self.template_name)
            return super().get(request, *args, **kwargs)
        except TemplateDoesNotExist as exp:
            raise Http404(
                """
                This URL is only used when you have built the production
                version of the app. Visit https://localhost:3000/ instead, or
                run 'npm run build' to test the production version.
                """
            ) from exp
