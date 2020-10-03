from dotenv import load_dotenv
from mysterio.settings.base import *

env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

SECRET_KEY = "cg#p$g+j9tax!#a3cup@1$8obt2_+&k3q+pmu)5%asj6yjpkag"

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
