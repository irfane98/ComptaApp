import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import accountingRoutes from './routes/accounting.js';
import journalRoutes from './routes/journals.js';
import accountRoutes from './routes/accounts.js';
import statementRoutes from './routes/statements.js';
import { verifyToken } from './middleware/auth.js';
import './db/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charger les variables d'environnement
config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rendre l'instance Socket.IO disponible pour les routes
app.set('io', io);

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/accounting', verifyToken, accountingRoutes);
app.use('/api/journals', verifyToken, journalRoutes);
app.use('/api/accounts', verifyToken, accountRoutes);
app.use('/api/statements', verifyToken, statementRoutes);

// Gestion des WebSockets
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});