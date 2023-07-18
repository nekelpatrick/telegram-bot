const fs = require("fs").promises; // use promises API

export async function getFileNames(directoryPath: string) {
  try {
    const files = await fs.readdir(directoryPath);
    return files;
  } catch (err) {
    console.error(`Failed to get file names: ${err}`);
  }
}

// getFileNames("./tmp");
