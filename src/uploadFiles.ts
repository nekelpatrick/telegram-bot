const fs = require("fs");
const path = require("path");
const oneDriveAPI = require("onedrive-api");

// Replace this with your actual access token
export async function uploadDirectory(accessToken: any) {
  // Get list of files in the /tmp directory
  const tmpDir = "tmp";
  fs.readdir(tmpDir, (err: any, files: any[]) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }

    // Upload each file to OneDrive
    files.forEach((file: any) => {
      const filePath = path.join(tmpDir, file);

      // Ensure the path is a file, not a directory
      if (fs.lstatSync(filePath).isFile()) {
        const readableStream = fs.createReadStream(filePath);

        oneDriveAPI.items
          .uploadSimple({
            accessToken,
            filename: file,
            readableStream,
          })
          .then((item: any) => {
            console.log(`Uploaded ${file} to OneDrive successfully`);
            console.log(item);
          })
          .catch((error: any) => {
            console.error(`Error uploading ${file} to OneDrive: ${error}`);
          });
      }
    });
  });
}
