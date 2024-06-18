# Use the official Python base image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the required packages
RUN pip install -r requirements.txt

# Set environment variables, if needed
# ENV VARIABLE_NAME value

# Copy the service account key file to the container
# COPY ./credentials.json /app/credentials.json

# Set environment variables
# ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json

# Copy the Django project code to the container
COPY . .

# Install the Cloud SQL Proxy
# RUN wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy \
#     && chmod +x cloud_sql_proxy \
#     && mv cloud_sql_proxy /usr/local/bin/

# Run any additional commands, if needed
RUN python manage.py collectstatic --noinput

# Expose the port that your Django app will run on
EXPOSE 8080

# Start the Django development server
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["uvicorn", "core.asgi:application", "--host", "0.0.0.0", "--port", "8080"]
# CMD ["daphne", "-u", "core.asgi:application", "-b", "0.0.0.0", "-p", "8000"]