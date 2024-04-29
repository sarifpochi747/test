# Use the official Python image as a base
FROM python:3.11

RUN apt-get update && apt-get install -y libgl1-mesa-glx
WORKDIR /app

COPY . .

RUN python3 -m venv /opt/my-venv
RUN pip install --upgrade pip
COPY . /app

RUN pip install -r requirements.txt

RUN pip uninstall -y deepface

EXPOSE 5001
CMD sh -c "uvicorn server:app --reload --port=5001 --host=0.0.0.0"