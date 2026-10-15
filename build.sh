#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python -c "import os; from urllib.parse import urlparse; u=urlparse(os.environ.get('DATABASE_URL','')); print('DB HOST =', u.hostname)"
python manage.py migrate
