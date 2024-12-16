# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set working directory in the container
WORKDIR /app

# Install system dependencies (if any needed for your Python packages)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install "fastapi[standard]"

# Copy the backend directory
COPY ./back-end .

# Copy the sqldata directory specifically
COPY ./back-end/sqldata ./sqldata

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose the port your FastAPI app runs on
EXPOSE 8080

# Use uvicorn as specified in your __main__ block
CMD ["fastapi", "run", "app.py", "--port", "8080"]