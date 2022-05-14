web: gunicorn --bind :8000 --workers 3  --threads 2 mysterio.wsgi:application
websocket: daphne mysterio.asgi:application --port 5000 --bind 0.0.0.0
periodic: celery -A mysterio worker -B -l INFO --concurrency 4 --scheduler django_celery_beat.schedulers:DatabaseScheduler
