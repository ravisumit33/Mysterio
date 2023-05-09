import os
import subprocess
from datetime import date
import logging
import boto3
from botocore.exceptions import ClientError
from django.core.management import CommandError
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """Custom management command to backup postgres db to s3"""

    help = "Backup db"

    def handle(self, *args, **options):
        def dump_db(filename):
            db_user = os.environ["DB_USER"]
            db_name = os.environ["DB_NAME"]
            db_pwd = os.environ["DB_PASSWORD"]
            cmd = (
                f"pg_dump "
                f"--host=localhost "
                f"--username={db_user} "
                f"--format=custom "
                f"--dbname={db_name} "
                f"--no-password "
                f"--file={filename}"
            )
            logger.info(cmd.split())
            try:
                subprocess.run(
                    cmd,
                    check=True,
                    capture_output=True,
                    shell=True,
                    env={**os.environ, "PGPASSWORD": db_pwd},
                )
            except subprocess.CalledProcessError as exc:
                logger.error(exc.stderr.decode("utf8"))
                raise CommandError from exc

        def upload_to_s3(filename):
            s3_client = boto3.client("s3")
            try:
                s3_client.upload_file(filename, "mysterio-db-backup", filename)
            except ClientError as exc:
                logging.error(exc)

        today = date.today()
        backup_file_name = f"{today}.dump"
        dump_db(backup_file_name)
        upload_to_s3(backup_file_name)
