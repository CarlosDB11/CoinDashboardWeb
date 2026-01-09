const { TelegramClient } = require("gramjs");
const { StringSession } = require("gramjs/sessions");
const { NewMessage } = require("gramjs/events");
const { Server } = require("socket.io");
const http = require("http");

const API_ID = Number(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const stringSession = process.env.TELEGRAM_SESSION;

const TARGET_CHANNELS = ["kolsignal", "degen_smartmoney", "bing_community_monitor", "solhousesignal", "nevadielegends", "PFsafeLaunch", "ReVoX_Academy", "dacostest", "pfultimate", "GemDynasty", "Bot_NovaX", "CCMFreeSignal", "KropClub", "ciphercallsfree", "solanagemsradar", "solana_whales_signal", "pingcalls", "gem_tools_calls", "SAVANNAHCALLS", "athenadefai", "Bigbabywhale", "SavannahSOL", "A3CallChan", "PEPE_Calls28", "gems_calls100x", "ai_dip_caller", "KingdomOfDegenCalls", "fttrenches_volsm", "loganpump", "bananaTrendingBot"];

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.start({
    phoneNumber: async () => await input.text("Number? "),
    password: async () => await input.text("Password? "),
    phoneCode: async () => await input.text("Code? "),
    onError: (err) => console.log(err),
  });

  console.log("Sesión guardada:", client.session.save());

  // Escuchador de mensajes
  client.addEventHandler(async (event) => {
    const message = event.message;
    const channel = await message.getChat();
    
    // Regex para CA de Solana
    const caRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const matches = message.text.match(caRegex);

    if (matches && TARGET_CHANNELS.includes(channel.username)) {
      matches.forEach(ca => {
        console.log(`Encontrado token ${ca} en ${channel.username}`);
        // ENVIAR AL FRONTEND
        io.emit("telegram_signal", {
          ca: ca,
          channel: channel.username,
          text: message.text
        });
      });
    }
  }, new NewMessage({}));

  server.listen(process.env.PORT || 3000, () => {
    console.log("Bridge escuchando...");
  });
})();


