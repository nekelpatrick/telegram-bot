import fs from "fs";
import { Dropbox } from "dropbox";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

class FileUploader {
  dbx: Dropbox;
  localFolderPath: string;
  dropboxFolderPath: string;

  constructor(localFolderPath: string, dropboxFolderPath: string) {
    this.dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });
    this.localFolderPath = localFolderPath;
    this.dropboxFolderPath = dropboxFolderPath;
  }

  // Create a method to get the current month name.
  getCurrentMonthName() {
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
    const currentMonthIndex = new Date().getMonth(); // Month index is 0-based.
    return monthsInPtBr[currentMonthIndex];
  }

  async getOrCreateFolder() {
    const monthName = this.getCurrentMonthName();
    let folderName = monthName;
    let folderFound = true;
    let counter = 1;
    let retryDelay = 2000; // Start with a 2-second delay.

    while (folderFound) {
      try {
        await this.dbx.filesGetMetadata({
          path: path.posix.join(this.dropboxFolderPath, folderName),
        });
        // If the above call doesn't throw an error, the folder exists.
        // So, we increment the counter and update the folder name.
        folderName = `${monthName}${counter++}`;
      } catch (error: any) {
        if (error.status === 409) {
          // If the error status is 409, the folder doesn't exist, so we create it.
          try {
            await this.dbx.filesCreateFolderV2({
              path: path.posix.join(this.dropboxFolderPath, folderName),
              autorename: false,
            });
            folderFound = false;
          } catch (createFolderError: any) {
            if (createFolderError.status === 429) {
              // If we've hit the rate limit, wait for a bit then retry.
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              retryDelay *= 2; // Double the delay for the next potential retry.
            } else {
              throw createFolderError;
            }
          }
        } else if (error.status === 429) {
          // If we've hit the rate limit, wait for a bit then retry.
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Double the delay for the next potential retry.
        } else {
          throw error;
        }
      }
    }

    return folderName;
  }
  async uploadFiles() {
    const files = fs.readdirSync(this.localFolderPath);
    const folderName = await this.getOrCreateFolder();

    const uploadPromises = files
      .filter((file) =>
        fs.lstatSync(path.join(this.localFolderPath, file)).isFile()
      )
      .map((file) => {
        const filePath = path.join(this.localFolderPath, file);
        const fileContent = fs.readFileSync(filePath);
        const dropboxPath = path.posix.join(
          this.dropboxFolderPath,
          folderName,
          file
        );

        return this.dbx
          .filesUpload({ path: dropboxPath, contents: fileContent })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });
      });

    return Promise.all(uploadPromises);
  }
}

export default FileUploader;
