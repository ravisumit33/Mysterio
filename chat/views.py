import json
from django.http import HttpResponse

def test_view(request):
    """Test chat api view
    """
    response_data = {
        'id': 4,
        'name': 'Hello world',
    }
    return HttpResponse(json.dumps(response_data), content_type="application/json")
