import express from "express";
import { Bot, Context, SessionFlavor, session, webhookCallback } from "grammy";
import dotenv from "dotenv";
import axios from "axios";

interface SessionData {
  started?: boolean;
  command?: string;
}

export type MyContext = SessionFlavor<SessionData> & Context;

// BOT INITIALIZATION
dotenv.config();
const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN || "");

// SESSION INITIALIZATION
function initial(): SessionData {
  return { started: false };
}

bot.use(session({ initial }));

// BOT COMMANDS
const botCommands = [
  // { command: "ola", description: "Be greeted by the bot" },
  { command: "baixar", description: "Baixar musicas" },
];

bot.api.setMyCommands(botCommands);

// COMMAND HANDLERS
bot.command("start", (ctx) => ctx.reply(introductionMessage));
bot.command("ola", (ctx) => ctx.reply(`Hello ${ctx.from?.username}`));
bot.command("baixar", handleBaixarCommand);

bot.catch(async (err) => console.error(`An error occurred: ${err}`));

// HANDLERS FUNCTIONS
function handleBaixarCommand(ctx: MyContext) {
  console.log('Received command "baixar"');
  ctx.reply("Mande um ou mais links do Youtube");
  ctx.session.command = "baixar";
}

// MIDDLEWARE FOR HANDLING MESSAGES
// MIDDLEWARE FOR HANDLING MESSAGES
bot.on("message", async (ctx) => {
  console.log("Received a message");
  console.log(ctx.session);

  if (ctx.session.command === "baixar" && "text" in ctx.message) {
    // Communicate with the API
    const url =
      "https://nominally-pleasing-herring.ngrok-free.app/api/download/";
    ctx.reply("Iniciando o download das músicas...");

    let isProcessing = true;

    // Set a timeout to send a message if processing takes too long
    const timeoutId = setTimeout(() => {
      if (isProcessing) {
        ctx.reply("Processando Músicas. Por favor, aguarde...");
      }
    }, 5000); // Timeout after 30 seconds. Adjust this value as needed.

    try {
      const response = await axios.post(url, ctx.message.text, {
        headers: { "Content-Type": "text/plain" },
      });

      // Cancel the timeout
      clearTimeout(timeoutId);
      isProcessing = false;

      // Send response back to the user
      // console.log(JSON.stringify(response));
      ctx.reply("Músicas prontas para baixar");
      ctx.reply("👍");
    } catch (error) {
      console.error(`Erro ao baixar músicas: ${error}`);
      ctx.reply(
        "Ocorreu um erro ao baixar as músicas. Por favor, tente novamente mais tarde."
      );
    }
  } else {
    ctx.reply(introductionMessage);
  }
});

// BOT STARTUP
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}

// MESSAGE DEFINITIONS
const introductionMessage = `Here are all available commands:
- /baixar: Baixar musicas`;
