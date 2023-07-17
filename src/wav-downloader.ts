import dotenv from "dotenv";
import { GoogleDriveService } from "./googleDriveService";
import { promisify } from "util";
import { convertMp3ToWav } from "./mp3-to-wav";
import { formatFileName } from "./format-file-name";
import { exec as callbackExec } from "child_process";
import fs from "fs/promises";

const exec = promisify(callbackExec);

dotenv.config();

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || "";
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || "";
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || "";
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "";

export async function wavDownloader(inputData: any, ctx: any) {
  const googleDriveService = new GoogleDriveService(
    driveClientId,
    driveClientSecret,
    driveRedirectUri,
    driveRefreshToken
  );
  const currentMonth = new Date().getMonth();
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
  const folderName = monthsInPtBr[currentMonth];

  let folder = await googleDriveService
    .searchFolder(folderName)
    .catch((error) => {
      console.error(error);
      return null;
    });

  if (!folder) {
    folder = await googleDriveService.createFolder(folderName);
  }

  console.log("Extracting URLs from data...");
  ctx.reply("Extracting URLs from input...");

  const urls = extractUrls(inputData, ctx);

  if (urls.length > 0) {
    console.log(`${urls.length} URLs found.`);
    ctx.reply(`${urls.length} URLs found.`);

    const ytDlpCommand = `yt-dlp -x --audio-format mp3 --restrict-filenames --progress --newline ${urls.join(
      " "
    )}`;

    ctx.reply("Downloading songs...");

    const { stdout, stderr } = await exec(ytDlpCommand);
    console.log("Download complete.", stdout, stderr);
    ctx.reply("Download complete.");

    console.log(
      `Converting and uploading ${urls.length} files to Google Drive...`
    );
    ctx.reply(
      `Converting and uploading ${urls.length} files to Google Drive...`
    );

    const promises = urls.map(async (url: string, index: number) => {
      console.log(`Converting ${url} to .wav format...`);

      const wavFilePath = await convertMp3ToWav(url);
      console.log(`Converted to .wav format: ${wavFilePath}`);

      await googleDriveService
        .saveFile(
          formatFileName(wavFilePath),
          wavFilePath,
          "audio/wav",
          folder?.id
        )
        .catch((error: any) => {
          console.error(error);
        });

      console.log(`Deleting the original .mp3 file: ${wavFilePath}`);
      await fs.unlink(wavFilePath);
    });

    await Promise.all(promises);

    console.log("All files have been converted and uploaded.");
    ctx.reply("All files have been converted and uploaded.");
  } else {
    console.log("No URLs found in the provided data.");
    ctx.reply("No URLs found in the input.");
  }
}

function extractUrls(data: string, ctx: any) {
  if (typeof data !== "string") {
    ctx.reply("The format sent is not valid.");
    throw new TypeError("The format sent is not valid.");
  }

  const regex =
    /(https?:\/\/(www\.)?youtube\.com\/watch\?v=.{11}|https?:\/\/youtu.be\/.{11})/g;
  const matches = data.match(regex);

  if (!matches) {
    ctx.reply("No Youtube URLs found.");
    throw new Error("No Youtube URLs found.");
  }

  return matches;
}
