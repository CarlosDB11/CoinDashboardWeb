const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const { Server } = require("socket.io");
const http = require("http");
const input = require("input");
require('dotenv').config();

// Corregido: Usar los nombres de variables que Railway inyecta
const API_ID = Number(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

const TARGET_CHANNELS = ["kolsignal", "degen_smartmoney", "bing_community_monitor", "solhousesignal", "nevadielegends", "PFsafeLaunch", "ReVoX_Academy", "dacostest", "pfultimate", "GemDynasty", "Bot_NovaX", "CCMFreeSignal", "KropClub", "ciphercallsfree", "solanagemsradar", "solana_whales_signal", "pingcalls", "gem_tools_calls", "SAVANNAHCALLS", "athenadefai", "Bigbabywhale", "SavannahSOL", "A3CallChan", "PEPE_Calls28", "gems_calls100x", "ai_dip_caller", "KingdomOfDegenCalls", "fttrenches_volsm", "loganpump", "bananaTrendingBot"];

const server = http.createServer();
const io = new Server(server, { 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  } 
});

(async () => {
  console.log("[SISTEMA] Iniciando Telegram Client...");
  
  const client = new TelegramClient(stringSession, API_ID, API_HASH, { 
    connectionRetries: 5 
  });

  await client.start({
    phoneNumber: async () => await input.text("Number? "),
    password: async () => await input.text("Password? "),
    phoneCode: async () => await input.text("Code? "),
    onError: (err) => console.log("[ERROR CLIENTE]", err),
  });

  console.log("[EXITO] Sesión de Telegram Activa.");
  if (!process.env.TELEGRAM_SESSION) {
    console.log("[AVISO] Guarda este String en tus Variables de Entorno (TELEGRAM_SESSION):", client.session.save());
  }

  // Escuchador de mensajes
  client.addEventHandler(async (event) => {
    try {
      const message = event.message;
      if (!message || !message.text) return;

      const chat = await message.getChat();
      const username = chat.username;

      if (!username || !TARGET_CHANNELS.includes(username)) return;

      // Regex para CA de Solana
      const caRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
      const matches = message.text.match(caRegex);

      if (matches) {
        matches.forEach(ca => {
          console.log(`[DETECTADO] ${ca} en @${username}`);
          io.emit("telegram_signal", {
            ca: ca,
            channel: username,
            text: message.text
          });
        });
      }
    } catch (e) {
      console.error("[ERROR HANDLER]", e.message);
    }
  }, new NewMessage({}));

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Bridge escuchando en puerto ${PORT}`);
  });
})();
