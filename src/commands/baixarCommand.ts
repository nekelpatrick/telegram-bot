// baixarCommand.ts
import { MyContext } from "..";
import { wavDownloader } from "../wav-downloader";

export async function baixarCommand(ctx: MyContext) {
  console.log('Processing "baixar" command');

  await ctx.reply("Validando URLs...");
  console.log("Validating URLs");

  await wavDownloader(ctx.message?.text, ctx);
  console.log("URLs processed");

  await Promise.all([
    ctx.reply("Músicas processadas."),
    ctx.reply("👍"),
    ctx.reply(
      "Baixar mais músicas? \n- /baixar: Baixar músicas a partir de URLs do YouTube"
    ),
  ]);

  // Reset the session command
  ctx.session.command = undefined;
}
