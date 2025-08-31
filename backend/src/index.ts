import express from 'express';
import Routes from './routes/Routes';
import cors from 'cors';
import pool from './config/database';

const app = express();
const port = process.env.PORT || 3001;

//app.use(cors());
app.use(cors({ origin: 'http://localhost:3000' }));

// Test de connexion à la base de données au démarrage
pool.getConnection()
  .then((connection) => {
    console.log('Connexion à la base de données réussie !');
    connection.release(); // Libère la connexion après le test
  })
  .catch((err) => {
    console.error('Échec de la connexion à la base de données :', err.message);
    process.exit(1); // Arrête le serveur si la connexion échoue
  });

app.get('/api/health', (req, res) => {
  pool.getConnection()
    .then((connection) => {
      connection.release();
      res.json({ status: 'connected', timestamp: new Date().toISOString() });
    })
    .catch((err) => {
      res.status(500).json({ status: 'disconnected', timestamp: new Date().toISOString() });
    });
});

app.use(express.json());

app.use('/api', Routes);

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});