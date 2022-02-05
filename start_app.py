from multiprocessing import Process
import subprocess
import os


def start_dev_smtp_server():
    """
    Start email smtp server
    """
    subprocess.run(
        ["python", "-m", "smtpd", "-n", "-c", "DebuggingServer", "localhost:1025"],
        check=True,
    )


def start_dev_backend_server():
    """
    Start backend server
    """
    subprocess.run(["python", "manage.py", "runserver"], check=True)


def start_background_tasks():
    """
    Run periodic background tasks
    """
    subprocess.run(
        [
            "celery",
            "-A mysterio",
            "worker",
            "-B",
            "-l INFO",
            "--scheduler django_celery_beat.schedulers:DatabaseScheduler",
        ],
        check=True,
    )


def start_dev_frontend_server():
    """
    Start frontend server
    """
    os.chdir("frontend")
    subprocess.run(["npm", "start"], check=True)


if __name__ == "__main__":
    backend_server = Process(target=start_dev_backend_server)
    smtp_server = Process(target=start_dev_smtp_server)
    background_tasks = Process(target=start_background_tasks)
    frontend_server = Process(target=start_dev_frontend_server)

    backend_server.start()
    smtp_server.start()
    background_tasks.start()
    frontend_server.start()

    backend_server.join()
    smtp_server.join()
    background_tasks.join()
    frontend_server.join()
