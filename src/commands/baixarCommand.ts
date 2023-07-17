// baixarCommand.ts
import { MyContext } from "..";
import { wavDownloader } from "../wav-downloader";

export async function baixarCommand(ctx: any) {
  console.log('Processing "baixar" command');

  await ctx.reply("Processando comando 'baixar'...");

  await ctx.reply("Validando URLs...");
  console.log("Validating URLs");

  try {
    await wavDownloader(ctx.message?.text, ctx);
  } catch (error) {
    console.log(`Erro ao baixar músicas: ${error}`);
    await ctx.reply(`Ocorreu um erro ao baixar as músicas`);
    return;
  }

  console.log("URLs processed");
  await ctx.reply("URLs processadas.");

  await ctx.reply("Baixando músicas...");

  // You can add here additional replies based on the wavDownloader function
  // results or progress, for example, when a song download starts or finishes.

  await ctx.reply("Músicas baixadas. Processando...");

  // You could add more steps here to inform the user about the processing status

  await ctx.reply("Músicas processadas. Pronto para ouvir! 👍");

  await ctx.reply(
    "Deseja baixar mais músicas? \n- /baixar: Baixar músicas a partir de URLs do YouTube"
  );

  // Reset the session command
  ctx.session.command = undefined;
}
