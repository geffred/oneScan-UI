# Étape 1 : Build de l'application
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY vite.config.js ./
COPY tsconfig.json ./
COPY index.html ./
COPY . .

# Installer toutes les dépendances (y compris devDependencies)
RUN npm ci

# Build de l'application
RUN npm run build

# Étape 2 : Serveur de production
FROM node:18-alpine AS production

WORKDIR /app

# Installer serveur static
RUN npm install -g serve

# Copier les fichiers buildés depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["serve", "-s", "dist", "-l", "3000"]