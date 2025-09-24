# Étape 1 : Build de l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration essentiels
COPY package*.json vite.config.js ./

# Installer les dépendances
RUN npm ci

# Copier tout le code source
COPY . .

# Build de l'application
RUN npm run build

# Étape 2 : Serveur de production
FROM node:20-alpine AS production

WORKDIR /app

# Installer un serveur statique
RUN npm install -g serve

# Copier uniquement les fichiers buildés
COPY --from=builder /app/dist ./dist

# Exposer le port (Railway fournit $PORT automatiquement)
EXPOSE 3000

# Lancer le serveur sur le port Railway ($PORT ou 3000 par défaut)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
