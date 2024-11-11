# ComptaOHADA - Guide d'installation

## Prérequis
- Node.js 18+ installé
- npm ou yarn

## Installation

1. Cloner le projet et installer les dépendances :
```bash
git clone <votre-repo>
cd compta-ohada
npm install
```

2. Créer le fichier `.env` à la racine du projet :
```env
JWT_SECRET="votre_secret_jwt_super_securise"
NODE_ENV="development"
PORT=3000
CLIENT_URL="http://localhost:5173"
```

3. Démarrer l'application :
```bash
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend : http://localhost:3000

## Structure du projet

```
.
├── server/                 # Backend Node.js
│   ├── db/                # Configuration SQLite
│   ├── middleware/        # Middlewares Express
│   ├── routes/           # Routes API
│   └── index.js          # Point d'entrée du serveur
├── src/                   # Frontend Vue.js
├── .env                   # Variables d'environnement
└── package.json          # Dépendances et scripts
```

## API Endpoints

### Authentification
- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion

### Utilisateurs (protégé)
- GET /api/users/profile - Obtenir le profil
- PUT /api/users/profile - Mettre à jour le profil

### Comptabilité (protégé)
- GET /api/accounting/transactions - Liste des transactions
- POST /api/accounting/transactions - Créer une transaction
- PUT /api/accounting/transactions/:id - Modifier une transaction
- DELETE /api/accounting/transactions/:id - Supprimer une transaction

## Base de données

L'application utilise SQLite pour la persistance des données. Le fichier de base de données sera créé automatiquement dans `server/db/database.sqlite`.

## WebSocket

L'application utilise Socket.IO pour les mises à jour en temps réel. Les événements disponibles sont :
- transactionCreated
- transactionUpdated
- transactionDeleted