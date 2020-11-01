# Mysterio
![GitHub](https://img.shields.io/github/license/ravisumit33/Mysterio?color=dark%20green)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](https://github.com/pre-commit/pre-commit)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ravisumit33/Mysterio)

[comment]: <> (Add Dependency badge after merging code from dev to master)

Anonymous chat web app

# Requirements
- Python >= 3.7
- Node >= 12.14.0
- npm >= 6.13.4
- Postgres >= 13.0

# Step for local developement
1. Install python dependencies (virtual environment recommended)
    ```bash
    pip install -r requirements_local.txt
    ```` 

2. Install node modules for frontend
    ```bash
    cd frontend
    npm install
    ```` 


3. Setup postgres
    - Create Database
    - Create User and give all privileges on above database
    - Grant `CREATEDB` permission to the user (for unit testing)

4. Setup environment variable
    - Copy `.env.example` to `.env`
    - Replace all variables having `<>` with your local values
    - Add other required environment varialbes

5. Start Development Server
    ```bash
    python manage.py runserver
    python manage.py run_periodic
    cd frontend && npm start
    ```` 



# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


# License
[MIT](https://choosealicense.com/licenses/mit/)
