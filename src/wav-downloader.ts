import dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs/promises";
import { exec as callbackExec } from "child_process";
import { GoogleDriveService } from "./googleDriveService";
import youtubedl from "youtube-dl-exec";
import { convertMp3ToWav } from "./mp3-to-wav";
import { formatFileName } from "./utils/format-file-name";
import { YtFlags } from "./types/yt-types";
import { promisify } from "util";

//dotenv.config();

const exec = promisify(callbackExec);
const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || "";
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || "";
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || "";
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "";
const musicDirectoryPath = "./tmp";

function getGoogleDriveService() {
  return new GoogleDriveService(
    driveClientId,
    driveClientSecret,
    driveRedirectUri,
    driveRefreshToken
  );
}

async function getFolder(service: GoogleDriveService) {
  const currentMonth = new Date().getMonth();

  let folder = await service
    .searchFolder(`musicas-pai/${monthsInPtBr[currentMonth]}`)
    .catch(console.error);

  if (!folder) {
    folder = await service.createFolder(
      `musicas-pai/${monthsInPtBr[currentMonth]}`
    );
  }

  return folder;
}

export async function downloadSongs(urls: string[]) {
  const downloadOptions: YtFlags = {
    extractAudio: true,
    audioFormat: "mp3",
    output: `${musicDirectoryPath}/%(title)s.%(ext)s`,
    noCheckCertificates: true,
    // help: true,
  };

  return Promise.all(
    urls.map((url) =>
      youtubedl(url, downloadOptions)
        // .then((output) => console.log(output))
        .catch(console.error)
    )
  );
}

export async function renameFiles(files: string[]) {
  const renamePromises = files.map((file) => {
    const oldPath = path.join(musicDirectoryPath, file);
    const newName = formatFileName(file);
    const newPath = path.join(musicDirectoryPath, newName);

    return fs.rename(oldPath, newPath).then(() => newName);
  });

  const renamedFiles = await Promise.all(renamePromises);
  return renamedFiles;
}

async function convertFiles(files: string[]) {
  const convertedFiles = [];

  for (const file of files) {
    const filePath = path.join(musicDirectoryPath, file);
    const wavFilePath = await convertMp3ToWav(filePath);
    convertedFiles.push(path.basename(wavFilePath));
  }

  return convertedFiles;
}

// async function uploadFiles(
//   service: GoogleDriveService,
//   folder: { id: any; name?: string },
//   files: string[]
// ) {
//   for (const file of files) {
//     const filePath = path.join(musicDirectoryPath, file);
//     const fileExtension = path.extname(filePath);

//     if (fileExtension === ".wav") {
//       await service
//         .saveFile(
//           path.basename(filePath, ".wav"),
//           filePath,
//           "audio/wav",
//           folder?.id
//         )
//         .catch(console.error);
//     }
//   }
// }

// async function deleteFiles(files: string[]) {
//   for (const file of files) {
//     const wavFilePath = path.join(musicDirectoryPath, file);

//     await fs.unlink(wavFilePath);
//   }
// }

export async function deleteAllFiles(directoryPath: string) {
  const files = await fs.readdir(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    await fs.unlink(filePath);
  }
}

export async function wavDownloader(inputData: any, ctx: any) {
  const urls = extractUrls(inputData, ctx);

  if (urls.length === 0) {
    ctx.reply("Nenhuma URL encontrada na entrada.");
    return;
  }

  // const service = getGoogleDriveService();
  // const folder = await getFolder(service);

  await downloadSongs(urls);
  let files = await fs.readdir(musicDirectoryPath);

  await renameFiles(files);
  console.log("files renamed");
  console.log("converting files");
  let files2 = await fs.readdir(musicDirectoryPath);
  await convertFiles(files2);
  let filesToUpload = await fs.readdir(musicDirectoryPath);

  // await uploadFiles(service, folder, filesToUpload);
  // await deleteAllFiles(musicDirectoryPath);

  console.info("All files uploaded successfully and local files deleted!");
  ctx.reply("Processo completo. Arquivos prontos.");
}

export function extractUrls(data: string, ctx?: any) {
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
