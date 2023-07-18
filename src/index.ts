import express from "express";
import { Bot, Context, SessionFlavor, session, webhookCallback } from "grammy";
import dotenv from "dotenv";
import { baixarCommand } from "./commands/baixarCommand";

dotenv.config();

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
  startInProduction();
} else {
  startBot();
}

function startBot() {
  bot.start().catch((err) => {
    console.error(`Failed to start the bot: ${err}`);
    console.log("Retrying in 10 seconds...");
    setTimeout(startBot, 10000);
  });
}

function startInProduction() {
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
}

// MESSAGE DEFINITIONS
const introductionMessage = `Aqui estão todos os comandos disponíveis:
- /baixar: Baixar músicas a partir de URLs do YouTube`;
