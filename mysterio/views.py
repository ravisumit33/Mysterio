from django.views.generic.base import TemplateView

class FrontendView(TemplateView):
    """Frontend View
    Inherits django.views.generic.base.TemplateView to render index.html
    from Frontend App
    """
    template_name = 'index.html'
