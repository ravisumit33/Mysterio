import os
import json
import boto3


class AWSSecretManager: #pylint: disable=too-few-public-methods
    """
    Manager for getting secrets from AWS
    """

    AWS_REGION_NAME = "ap-south-1"

    def __init__(self):
        self._session = boto3.session.Session()
        self.client =  self._session.client(
            service_name='secretsmanager',
            region_name=self.AWS_REGION_NAME
        )

    def load_secrets(self, secret_name='mysterio'):
        """
        Gets secrets from aws secret manager and loads them into environment variables
        """
        try:
            if secret_name == '':
                raise Exception("Secret Name cannot be Null ")
            get_secret_value_response = self.client.get_secret_value(
                SecretId=secret_name
            )
            if 'SecretString' in get_secret_value_response:
                secret = get_secret_value_response['SecretString']
                secret = json.loads(secret)
                for key, value in secret.items():
                    os.environ[key] = value
        except Exception as exp:
            raise exp

secret_manager = AWSSecretManager()
