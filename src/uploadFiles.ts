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

  uploadFiles(): void {
    const files = fs.readdirSync(this.localFolderPath);

    files.forEach((file) => {
      const filePath = path.join(this.localFolderPath, file);
      const fileContent = fs.readFileSync(filePath);
      const dropboxPath = path.posix.join(this.dropboxFolderPath, file);

      this.dbx
        .filesUpload({ path: dropboxPath, contents: fileContent })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
}

export default FileUploader;
