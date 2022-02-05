web: daphne mysterio.asgi:application --port $PORT --bind 0.0.0.0
periodic: celery -A mysterio worker -B -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
