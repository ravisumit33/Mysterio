
# Mysterio

![GitHub](https://img.shields.io/github/license/ravisumit33/Mysterio?color=dark%20green)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](https://github.com/pre-commit/pre-commit)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ravisumit33/Mysterio)

[comment]: <> (Add Dependency badge after merging code from dev to master)

Anonymous chat web app

# Requirements

- Python >= 3.7
- Node >= 12.14.0
- npm >= 6.13.4
- Postgres >= 13.0
- Redis >= 6.0.8

# Steps for local developement

1. Install python dependencies (virtual environment recommended)

    ```sh
    pip install -r requirements_local.txt
    ```

2. Install node modules for frontend

    ```sh
    cd frontend && npm install && cd ..
    ```

3. Setup postgres
    - Run postgres on `localhost:5432`(default)
    - Create a database
    - Create a user and give all privileges on above database
    - Grant `CREATEDB` permission to the user (for unit testing)

4. Setup redis
    - Run redis on `localhost:6379`(default)

5. Setup environment variable
    - Copy `.env.example` to `.env`
    - Replace all variables having `<>` with your local values
    - Add other required environment variables

6. Start development servers in different terminals

    ```sh
    python manage.py runserver
    cd frontend && npm start
    ```

7. Start background task in another terminal

    ```sh
    python manage.py run_periodic
    ```

# Contributing

Pull requests are welcome.
For major changes, please open an issue first to discuss what you would like to change.

# License

[MIT](https://choosealicense.com/licenses/mit/)
