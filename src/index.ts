import express from "express";
import { Bot, Context, SessionFlavor, session, webhookCallback } from "grammy";
import { baixarCommand } from "./commands/baixarCommand";
import dotenv from "dotenv";

dotenv.config();

interface SessionData {
  started?: boolean;
  command?: string;
}

export type MyContext = SessionFlavor<SessionData> & Context;

const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN || "");

const initialSessionData: any = { started: false };

bot.use(session({ initial: initialSessionData }));

const greetingCommand = (ctx: MyContext) => {
  ctx.session.started = true;
  return ctx.reply(`Olá ${ctx.from?.username}`);
};

bot.command("start", greetingCommand);
bot.command("ola", greetingCommand);

bot.command("baixar", (ctx) => {
  ctx.session.started = true;
  ctx.session.command = "baixar";
  return ctx.reply("Mande um ou vários links do YouTube.");
});

bot.on("message", async (ctx) => {
  if (ctx.session.command === "baixar") {
    await baixarCommand(ctx);
  } else {
    replyWithIntro(ctx);
  }
});

const introductionMessage = `Aqui estão todos os comandos disponíveis:
- /baixar: Baixar músicas a partir de URLs do YouTube`;

const replyWithIntro = (ctx: MyContext) => ctx.reply(introductionMessage);
bot.command("start", replyWithIntro);

bot.catch((err) => {
  console.error(`Ocorreu um erro: ${err}`);
});

bot.api.setMyCommands([
  { command: "ola", description: "Be greeted by the bot" },
  { command: "baixar", description: "Baixar uma ou várias músicas" },
]);

if (process.env.NODE_ENV === "production") {
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  bot.start();
}
