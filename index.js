const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado al bridge:', socket.id);
  
  // Simulación de envío de tokens para probar la conexión
  // En producción, aquí iría tu lógica de Telegram
  setInterval(() => {
    socket.emit('new_token', {
      baseToken: { address: "So11111111111111111111111111111111111111112", symbol: "SOL", name: "Solana" },
      priceUsd: "145.20",
      fdv: 65000000000,
      info: { imageUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" }
    });
  }, 10000);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Bridge funcionando en puerto ${PORT}`);
});
