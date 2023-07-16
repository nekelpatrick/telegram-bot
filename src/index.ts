import { Bot, webhookCallback } from "grammy";
import express from "express";
import { wavDownloader } from "./wav-downloader";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

const introductionMessage = `Aqui estão todos os comandos disponíveis:
- /baixarMusicas: Baixar músicas a partir de URLs do YouTube`;

// Handle the /yo command to greet the user
bot.command("ola", (ctx) => ctx.reply(`Yo ${ctx.from?.username}`));

bot.command("baixar", (ctx: any) => {
  ctx.reply(`Mande um ou vários links do YouTube.`);
  bot.on("message", async (ctx: any) => {
    try {
      // logger();
      await ctx.reply(`Validando URL's...`);
      await wavDownloader(ctx.message.text, ctx);
      await ctx.reply(`Músicas processadas.`);
      await ctx.reply("👍");
      ctx.reply(`
   Baixar mais músicas?
   - /baixarMusicas: Baixar músicas a partir de URLs do YouTube
        `);
    } catch (error) {
      await ctx.reply("👎");
      console.error(`Ocorreu um erro: ${error}`);
      ctx.reply(`
   Tentar novamente:
   - /baixarMusicas: Baixar músicas a partir de URLs do YouTube
        `);
    }
  });
});

// Handle all other messages and the /start command

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "ola", description: "Be greeted by the bot" },
  {
    command: "baixar",
    description: "Baixar uma ou várias músicas",
  },
]);

const replyWithIntro = (ctx: any) => ctx.reply(introductionMessage);

bot.command("start", replyWithIntro);
bot.on("message", replyWithIntro);

// Start the server
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
