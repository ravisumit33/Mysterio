web: gunicorn --bind :8000 --workers 3  --threads 2 mysterio.wsgi:application
websocket: daphne -v 0 mysterio.asgi:application --port 5000 --bind 0.0.0.0
worker: celery -A mysterio worker -l INFO --concurrency 3
periodic: celery -A mysterio beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
