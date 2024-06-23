## Installation

This system is local but requires an internet connection to fetch data from external APIs. Follow these steps to install and prepare your system for use:

### 1. Install Python and Node.js

Make sure you have Python and Node.js installed, as they are necessary for the backend and frontend applications, respectively.

### 2. Create a Virtual Environment (Backend)

It is recommended to create a Python virtual environment to avoid conflicts between libraries. You can do this using the following command:

```sh
python -m venv venv
```

Activate the virtual environment (on Windows) with the command:

```sh
.\venv\Scripts\activate
```

### 3. Install Dependencies (Backend)

The main dependencies needed for the project to run are Django, Django Ninja, TensorFlow, and Django REST framework. However, you can install all dependencies with the command:

```sh
pip install -r requirements.txt
```

(Note: Some dependencies may be redundant due to multiple project changes.)

### 4. Install Dependencies (Frontend)

In the frontend directory, ensure you have Node.js and npm installed. Then run the command:

```sh
npm install
```

### 5. Create a .env File

Create a `.env` file in the root directory of your project and add the following environment variables. Replace the placeholder values with your actual values.

```env
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_TEST_NAME=your_database_test_name
```

### 6. Start the System

Start the backend system using:

```sh
python manage.py runserver
```

Start the frontend system using:

```sh
npm start
```

or

```sh
yarn start
```

By following these steps, your project should be set up and ready to use.
