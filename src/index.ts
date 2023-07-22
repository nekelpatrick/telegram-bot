import express from "express";
import { Bot, Context, SessionFlavor, session, webhookCallback } from "grammy";
import dotenv from "dotenv";
import { baixarCommand } from "./commands/baixarCommand";
import axios from "axios";
import qs from "qs";

interface SessionData {
  started?: boolean;
  command?: string;
  pizzaCount?: number;
}

export type MyContext = SessionFlavor<SessionData> & Context;

// BOT INITIALIZATION
const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN || "");

// SESSION INITIALIZATION
function initial(): SessionData {
  return { started: false };
}

bot.use(session({ initial }));

// BOT COMMANDS
const botCommands = [
  { command: "ola", description: "Be greeted by the bot" },
  { command: "baixar", description: "Baixar uma ou várias músicas" },
];

bot.api.setMyCommands(botCommands);

// COMMAND HANDLERS
bot.command("start", (ctx) => ctx.reply(introductionMessage));
bot.command("ola", (ctx) => ctx.reply(`Olá ${ctx.from?.username}`));
bot.command("baixar", handleBaixarCommand);
bot.on("message", handleMessages);
bot.catch(async (err) => console.error(`Ocorreu um erro: ${err}`));

// HANDLERS FUNCTIONS
function handleBaixarCommand(ctx: MyContext) {
  console.log('Received command "baixar"');
  ctx.reply("Mande um ou vários links do YouTube.");
  ctx.session.command = "baixar";
}

async function handleMessages(ctx: MyContext) {
  console.log("Received a message");
  console.log(ctx.session);

  if (ctx.session.command === "baixar") {
    await baixarCommand(ctx);
  } else if (ctx.session.command !== "baixar") {
    replyWithIntro(ctx);
  }
}

function replyWithIntro(ctx: MyContext) {
  ctx.reply(introductionMessage);
}

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
const introductionMessage = `Aqui estão todos os comandos disponíveis:
- /baixar: Baixar músicas a partir de URLs do YouTube`;
