import logging
from django.views.generic.base import TemplateView
from django.template.exceptions import TemplateDoesNotExist
from django.http import Http404
from django.template.loader import get_template
from django.shortcuts import render

logger = logging.getLogger("mysterio")

class FrontendView(TemplateView):
    """Frontend View
    Inherits django.views.generic.base.TemplateView to render index.html
    from Frontend App
    """
    template_name = 'index.html'

    def get(self, request, *args, **kwargs):
        session = request.session
        if session.session_key is None:
            session.create()
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

def handler400(request, exception=None):
    """Custom 400 error View
    """
    return render(request, '400.html', status=400)

def handler403(request, exception=None):
    """Custom 403 error View
    """
    return render(request, '403.html', status=403)

def handler404(request, exception=None):
    """Custom 404 error View
    """
    return render(request, '404.html', status=404)

def handler500(request, exception=None):
    """Custom 500 error View
    """
    return render(request, '500.html', status=500)
