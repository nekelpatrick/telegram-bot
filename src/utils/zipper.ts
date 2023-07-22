import fs from "fs";
import archiver from "archiver";

export const fileZipper = async (
  directoryPath: string,
  zipPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // create a file to stream archive data to
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 5 }, // Sets the compression level
    });

    // listen for all archive data to be written
    output.on("close", () => {
      console.log(`${archive.pointer()} total bytes written`);
      console.log(
        "Archiver has been finalized and the output file descriptor has closed."
      );
      resolve();
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn(err);
      } else {
        // throw error to reject Promise
        reject(err);
      }
    });

    // good practice to catch this error explicitly
    archive.on("error", (err) => {
      reject(err);
    });

    // track progress
    archive.on("progress", (progress) => {
      console.log(
        `[PROGRESS] - Processed ${progress.entries.processed} out of ${progress.entries.total} entries.`
      );
      var fileSizeInMegabytes = progress.fs.processedBytes / (1024 * 1024);

      console.log(
        `[PROGRESS] - Total size ${fileSizeInMegabytes} of MegaBytes.`
      );
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a directory
    archive.directory(directoryPath, false);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();
  });
};

export default fileZipper;
