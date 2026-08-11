# Usa una imagen de Node.js
FROM node:18

# Copia el contenido de la carpeta app-web al contenedor
COPY ../app-web/ .

# Instala las dependencias
RUN npm install

# Expón los puertos para el frontend (React) y el backend (Express)
EXPOSE 3000 8888

# Comando para ejecutar ambos servicios
CMD ["sh", "-c", "npm run back & npm run front"]