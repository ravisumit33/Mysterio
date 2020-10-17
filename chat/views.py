from django.http import JsonResponse

def test_view(request):
    """Test chat api view
    """
    response_data = {
        'id': 4,
        'name': 'Hello world',
    }
    return JsonResponse(response_data)
