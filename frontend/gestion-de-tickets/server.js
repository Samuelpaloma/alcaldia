const express = require('express');
const path = require('path');
const { createServer } = require('./server');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del build de React
app.use(express.static(path.join(__dirname, 'dist/spa')));

// API routes
app.use('/api', createServer());

// Para todas las demás rutas, servir el index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/spa', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
