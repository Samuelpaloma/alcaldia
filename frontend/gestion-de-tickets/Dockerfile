# Dockerfile para React en Render
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para ejecutar
CMD ["npm", "run", "start:prod"]