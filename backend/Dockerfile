# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code into the container at /app
COPY . .

# Expose port 8000 for the Django app
EXPOSE 8000

# Run Django development server when the container launches
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Copy the Mitre Attack Data
COPY enterprise-attack.json .

# Copy the threat scenario import script
COPY add_threat.py .

# Copy the data import script
COPY stix_data_loader.py .