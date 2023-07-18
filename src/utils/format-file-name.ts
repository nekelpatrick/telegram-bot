import path from "path";

export function formatFileName(fileName: string) {
  const ext = path.extname(fileName);
  fileName = fileName.replace(ext, "");

  let newName = fileName;

  newName = newName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  newName = newName.replace(/[\(\)=⧸.,?!]/g, "");

  newName = newName.replace(/\.+/g, ".");

  newName = newName.replace(/&/g, "e");

  newName = newName.replace(/\b\d+$/g, "");

  const removeWords = [
    "karaoke",
    "playback",
    "oficial",
    "qualidade",
    "melhor",
    "com letra",
    "musica com primeira voz e letra",
    "playback oficial melhor qualidade",
    "playback oficial com letra",
    "jn karaoke",
    "karaokê tcho",
    "2 tons abaixo",
    "playback oficial",
    "oficial",
    "jn",
    "tcho",
    "original c letra",
    "com vocais",
    "made popular by",
    "version",
    "medley",
  ];

  for (const word of removeWords) {
    newName = newName.replace(new RegExp("\\b" + word + "\\b", "gi"), " ");
  }

  newName = newName.replace(/\s+/g, " ").trim();

  newName = newName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  if (newName.endsWith(" -")) {
    newName = newName.slice(0, newName.length - 2);
  }

  newName = newName.replace(/\s+-\s+/g, " - ");

  newName = newName.replace(/"/g, "");

  newName = newName.replace(/ -  - | ＂ ＂ /g, " -");

  newName = newName.replace(" - -", " - ");
  newName = newName.replace(/--+/g, "-");
  newName = newName.replace(/\s{2,}/g, " ").trim();

  // New: replace underscores with a space
  newName = newName.replace(/_/g, " ");

  // New: replace hyphens between words with a space
  newName = newName.replace(/(\w)-(\w)/g, "$1 $2");

  // New: remove special characters
  newName = newName.replace(/[@#$%]/g, "");

  return newName + ext;
}
