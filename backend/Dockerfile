# Use Python 3.14 as the core engine
FROM python:3.14-slim

WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies from the requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 7860 - this is the standard for HuggingFace Spaces
EXPOSE 7860

# Run the API using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860", "--reload"]