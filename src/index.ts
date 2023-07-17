// main.ts
import express from "express";
import { Bot, Context, SessionFlavor, session, webhookCallback } from "grammy";
import { baixarCommand } from "./commands/baixarCommand";
import dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { GoogleDriveService } from "./googleDriveService";

dotenv.config();

interface SessionData {
  started?: boolean;
  command?: string;
  pizzaCount?: number;
}

export type MyContext = SessionFlavor<SessionData> & Context;

const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN || "");

function initial(): SessionData {
  return { started: false };
}

bot.use(session({ initial }));

bot.command("start", (ctx) => {
  ctx.session.started = true;
  return ctx.reply("Started");
});

bot.command("ola", (ctx) => {
  ctx.session.started = true;
  ctx.reply(`Olá ${ctx.from?.username}`);
});

bot.command("baixar", (ctx) => {
  ctx.session.started = true;

  console.log('Received command "baixar"');
  ctx.reply("Mande um ou vários links do YouTube.");
  ctx.session.command = "baixar";
});

bot.on("message", async (ctx) => {
  console.log("Received a message");
  console.log(ctx.session);

  if (ctx.session.command === "baixar") {
    await baixarCommand(ctx);
  }
});

bot.api.setMyCommands([
  { command: "ola", description: "Be greeted by the bot" },
  {
    command: "baixar",
    description: "Baixar uma ou várias músicas",
  },
]);

const replyWithIntro = (ctx: MyContext) => ctx.reply(introductionMessage);

bot.command("start", replyWithIntro);
bot.catch(async (err) => {
  console.error(`Ocorreu um erro: ${err}`);
});

dotenv.config();

console.log(process.env.GOOGLE_DRIVE_CLIENT_ID);
console.log(process.env.GOOGLE_DRIVE_CLIENT_SECRET);
console.log(process.env.GOOGLE_DRIVE_REDIRECT_URI);
console.log(process.env.GOOGLE_DRIVE_REFRESH_TOKEN);

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

const introductionMessage = `Aqui estão todos os comandos disponíveis:
- /baixar: Baixar músicas a partir de URLs do YouTube`;
