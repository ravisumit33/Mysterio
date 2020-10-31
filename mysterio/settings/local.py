from dotenv import load_dotenv
from mysterio.settings.base import * # pylint: disable=W0614,W0401

env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

SECRET_KEY = "cg#p$g+j9tax!#a3cup@1$8obt2_+&k3q+pmu)5%asj6yjpkag"

DEBUG = True
TEMPLATE_DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": os.getenv('DB_NAME'),
        "USER": os.getenv('DB_USER'),
        "PASSWORD": os.getenv('DB_PASSWD'),
        "HOST": "localhost",
        "PORT": "5432",
    }
}

CHANNEL_LAYERS['default']['CONFIG'] = {
    'hosts': ['redis://127.0.0.1:6379'],
}

LOGGING['loggers'] = {
    'mysterio': {
        'level': 'DEBUG',
    },
    'chat': {
        'level': 'DEBUG',
    },
    'django': {
        'level': 'WARNING',
    }
}

LOGGING['handlers']['console']['formatter'] = 'simple'

ALLOWED_HOSTS = ["*"]
