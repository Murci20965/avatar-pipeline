# Use Python 3.14 as the core engine
FROM python:3.14-slim

WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies from the requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application itself, so the image runs on its own (no bind mount)
COPY . .

# Expose port 7860 - this is the standard for HuggingFace Spaces
EXPOSE 7860

# Run the API using Uvicorn (no --reload: that is a development flag)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]