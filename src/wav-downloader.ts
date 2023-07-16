import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { convertMp3ToWav } from "./mp3-to-wav";
import { formatFileName } from "./format-file-name";
import { exec as callbackExec } from "child_process";

const exec = promisify(callbackExec);

export async function wavDownloader(inputData: any, ctx: any) {
  const monthsInPtBr = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const currentMonth = new Date().getMonth();
  const musicDirectoryPath = `C:/Users/nekel/OneDrive/Área de Trabalho/musicas-pai/${monthsInPtBr[currentMonth]}`;

  // Create directory if not exists
  try {
    await fs.access(musicDirectoryPath);
  } catch (error) {
    await fs.mkdir(musicDirectoryPath, { recursive: true });
  }

  console.log("Extraindo URLs dos dados...");
  ctx.reply("Extraindo URLs da entrada...");

  const urls = extractUrls(inputData, ctx);

  if (urls.length > 0) {
    console.log(`${urls.length} URLs encontradas.`);
    ctx.reply(`${urls.length} URLs encontradas.`);

    const ytDlpCommand = `yt-dlp -x --audio-format mp3 --restrict-filenames -o "${musicDirectoryPath}/%(title)s.%(ext)s" ${urls.join(
      " "
    )} --progress --newline`;

    ctx.reply("Baixando músicas...");

    const { stdout, stderr } = await exec(ytDlpCommand);
    console.log("Download concluído.", stdout, stderr);
    ctx.reply("Download concluído.");

    console.log("Listando os arquivos...");
    const files = await fs.readdir(musicDirectoryPath);

    console.log(`Renomeando e convertendo ${files.length} arquivos...`);
    ctx.reply(`Renomeando e convertendo ${files.length} arquivos...`);

    const promises = files.map(async (file: string, index: number) => {
      const oldPath = path.join(musicDirectoryPath, file);
      const newPath = path.join(musicDirectoryPath, formatFileName(file));

      await fs.rename(oldPath, newPath);
      console.log(`Renomeado ${oldPath} para ${newPath}`);

      console.log(`Convertendo ${newPath} para o formato .wav...`);

      const wavFilePath = await convertMp3ToWav(newPath);
      console.log(`Convertido para o formato .wav: ${wavFilePath}`);

      console.log(`Deletando o arquivo .mp3 original: ${newPath}`);
      await fs.unlink(newPath);
    });

    await Promise.all(promises);

    console.log("Todos os arquivos foram renomeados e convertidos.");
    ctx.reply("Todos os arquivos foram renomeados e convertidos.");

    console.log("Abrindo a pasta de saída na guia do explorer...");
    ctx.reply("Processo completo. Arquivos prontos.");

    await exec(`start "" "${musicDirectoryPath}"`);
  } else {
    console.log("Nenhuma URL encontrada nos dados fornecidos.");
    ctx.reply("Nenhuma URL encontrada na entrada.");
  }
}

function extractUrls(data: string, ctx: any) {
  if (typeof data !== "string") {
    ctx.reply("O formato enviado não é válido.");
    throw new TypeError("O formato enviado não é válido.");
  }

  const regex =
    /(https?:\/\/(www\.)?youtube\.com\/watch\?v=.{11}|https?:\/\/youtu.be\/.{11})/g;
  const matches = data.match(regex);

  if (!matches) {
    ctx.reply("Não foram encontrados URL's do Youtube.");
    throw new Error("Não foram encontrados URL's do Youtube.");
  }

  return matches;
}
