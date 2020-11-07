from django.urls import path
import chat.views as ChatView

urlpatterns = [
    path("", ChatView.test_view, name="test"),
]
