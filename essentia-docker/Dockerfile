FROM python:3.10-slim

# Instala dependencias del sistema necesarias para Essentia y FFmpeg
RUN apt-get update && apt-get install -y \
    libfftw3-dev \
    libyaml-dev \
    libsamplerate0-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia primero el requirements
COPY requirements.txt .

# Instala NumPy antes por compatibilidad con Essentia
RUN pip install --no-cache-dir "numpy<2" && \
    pip install --no-cache-dir -r requirements.txt

# Copia el resto del código
COPY . .

# Expone el puerto del servidor Flask
EXPOSE 5000

# Comando para iniciar Flask
CMD ["python", "process_audio.py"]
