from mysterio.settings.base import * # pylint: disable=W0614,W0401

SECRET_KEY = os.getenv('SECRET_KEY')

DEBUG = False

ALLOWED_HOSTS = []

CHANNEL_LAYERS['default']['CONFIG'] = {
    'hosts': [os.getenv('REDIS_URL')],
}
