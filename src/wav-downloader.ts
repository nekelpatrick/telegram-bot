import dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs/promises";
import { promisify } from "util";
import { exec as callbackExec } from "child_process";
import { convertMp3ToWav } from "./mp3-to-wav";
import { formatFileName } from "./format-file-name";
import { GoogleDriveService } from "./googleDriveService";
import youtubedl from "youtube-dl-exec";
import { YtFlags } from "./yt-types";

dotenv.config();

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || "";
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || "";
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || "";
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "";

const exec = promisify(callbackExec);

export async function wavDownloader(inputData: any, ctx: any) {
  console.log("wavDownloader called");

  function extractUrls(data: string, ctx: any) {
    console.log("Extracting URLs");

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
    console.log("Extracted URLs: ", matches);

    return matches;
  }

  const googleDriveService = new GoogleDriveService(
    driveClientId,
    driveClientSecret,
    driveRedirectUri,
    driveRefreshToken
  );

  const currentMonth = new Date().getMonth();
  const musicDirectoryPath = `/tmp`;

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
  let folder = await googleDriveService
    .searchFolder(`musicas-pai/${monthsInPtBr[currentMonth]}`)
    .catch((error) => {
      console.error(error);
      return null;
    });

  if (!folder) {
    folder = await googleDriveService.createFolder(
      `musicas-pai/${monthsInPtBr[currentMonth]}`
    );
  }

  const urls = extractUrls(inputData, ctx);

  if (urls.length > 0) {
    async function downloadSongs() {
      const downloadOptions: YtFlags = {
        audioFormat: "mp3",
        output: `${musicDirectoryPath}/%(title)s.%(ext)s`,
        noCheckCertificates: true,
      };

      const promises = urls.map(async (url: string) => {
        console.log("downloading songs");
        try {
          await youtubedl.exec(url, downloadOptions);
        } catch (error) {
          console.error(error);
        }
      });

      await Promise.all(promises);
    }

    await downloadSongs();

    const files = await fs.readdir(musicDirectoryPath);

    const promises = files.map(async (file: string, index: number) => {
      const oldPath = path.join(musicDirectoryPath, file);
      const newPath = path.join(musicDirectoryPath, formatFileName(file));

      await fs.rename(oldPath, newPath);

      const wavFilePath = await convertMp3ToWav(newPath);

      // Upload to Google Drive
      await googleDriveService
        .saveFile(
          path.basename(wavFilePath, ".wav"),
          wavFilePath,
          "audio/wav",
          folder?.id
        )
        .catch((error: any) => {
          console.error(error);
        });

      // Delete local file after upload
      await fs.unlink(wavFilePath);
    });

    await Promise.all(promises);

    console.info("All files uploaded successfully and local files deleted!");
    ctx.reply("Processo completo. Arquivos prontos.");
  } else {
    console.log("Nenhuma URL encontrada nos dados fornecidos.");
    ctx.reply("Nenhuma URL encontrada na entrada.");
  }
}
