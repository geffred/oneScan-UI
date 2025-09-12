# Étape 1 : Build de l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./

# Copier tsconfig.json s'il existe
COPY tsconfig.json ./ 2>/dev/null || true

# Installer toutes les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Étape 2 : Serveur de production
FROM node:20-alpine AS production

WORKDIR /app

# Installer serveur static
RUN npm install -g serve

# Copier les fichiers buildés depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["serve", "-s", "dist", "-l", "3000"]