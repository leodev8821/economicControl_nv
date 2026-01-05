#!/bin/bash

# Este script navega a la carpeta de bases de datos y ejecuta Docker Compose.

# Define la ruta a la carpeta de bases de datos
DEV_DB_PATH=~/dev-databases

# Verifica si el directorio existe
if [ ! -d "$DEV_DB_PATH" ]; then
  echo "Error: El directorio '$DEV_DB_PATH' no existe."
  exit 1
fi

# Navega al directorio
echo "Navegando a: $DEV_DB_PATH"
cd "$DEV_DB_PATH"

# Ejecuta el comando docker compose
echo "Levantando el servicio de databases..."
docker-compose up -d

# Verifica si el comando anterior se ejecutó correctamente
if [ $? -eq 0 ]; then
  echo "Docker Compose se ejecutó con éxito. ¡Listo! 😊"
else
  echo "Hubo un error al ejecutar Docker Compose. Por favor, revisa los mensajes de error."
  exit 1
fi