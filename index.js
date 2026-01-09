const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const http = require("http");
const { Server } = require("socket.io");
const fetch = require("node-fetch");
require("dotenv").config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Esto permite que el Dashboard se conecte
    methods: ["GET", "POST"]
  }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => { // Escuchar en 0.0.0.0 es clave
  console.log(`Servidor Bridge activo en puerto ${PORT}`);
});

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || ""); 

const app = require("express")();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  
  // Si no tienes sesión, esto imprimirá una para que la guardes en Railway
  await client.start({
    phoneNumber: async () => await new Promise(r => console.log("Ingresa tu num en consola")),
    password: async () => await new Promise(r => console.log("Ingresa tu pass")),
    phoneCode: async () => await new Promise(r => console.log("Ingresa el código")),
    onError: (err) => console.log(err),
  });

  console.log("Sesión Guardada:", client.session.save());

  client.addEventHandler(async (event) => {
    const message = event.message.message;
    const solanaAddrRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/;
    const match = message.match(solanaAddrRegex);

    if (match) {
      const ca = match[0];
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
        const data = await res.json();
        if (data.pairs && data.pairs[0]) {
          io.emit("new_token", data.pairs[0]);
          console.log("Token enviado al frontend:", data.pairs[0].baseToken.symbol);
        }
      } catch (e) { console.error("Error validando CA", e); }
    }
  }, new NewMessage({}));

  server.listen(process.env.PORT || 3000, () => console.log("Servidor Bridge listo"));
})();
