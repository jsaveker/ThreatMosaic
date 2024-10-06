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

# Expose port 5000 for the Flask app
EXPOSE 5000

# Define environment variable for Flask
ENV FLASK_APP=app.py

# Run app.py when the container launches
CMD ["flask", "run", "--host=0.0.0.0"]

# Copy the data import script
COPY import_stix.py .

# Copy the Mitre Attack Data
COPY enterprise-attack.json .

# Copy the Mitre Attack Data
COPY add_threat.py .

# Run the data import script (this will run during the build process)
# RUN python import_stix.py

# Run the Threat Scenario import script (this will run during the build process)
# RUN add_threat.py