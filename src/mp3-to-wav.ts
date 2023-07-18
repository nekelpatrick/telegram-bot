import ffmpeg from "fluent-ffmpeg";
import path from "path";

function isMp3File(mp3Filename: string) {
  const ext = path.extname(mp3Filename);
  return ext === ".mp3";
}

export function convertMp3ToWav(mp3Filename: string): Promise<string> {
  console.log(mp3Filename);
  return new Promise((resolve, reject) => {
    if (!isMp3File(mp3Filename)) {
      throw new Error(`Not an mp3 file`);
    }

    const outputFile = mp3Filename.replace(".mp3", ".wav");

    ffmpeg(mp3Filename)
      .audioChannels(2)
      .audioFrequency(44100)
      .on("error", (err: any) => {
        console.log(err);
        reject(err);
      })
      .on("end", () => {
        resolve(outputFile);
      })
      .save(outputFile);
  });
}
