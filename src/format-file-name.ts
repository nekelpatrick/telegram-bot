export function formatFileName(fileName: string) {
  let newName = fileName;

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
    "karaokê tchô",
    "2 tons abaixo",
    "playback oficial",
  ];

  const removePatterns = [
    /\d+/g, // remove numbers
    /[-_=+]/g, // replace '-_=+' with ' '
    /[^\w\s]/gi, // remove special characters
    /\s*\.\s*$/, // remove trailing '.'
    /\s*-\s*$/, // remove trailing '-'
  ];

  // convert to lower case for comparison
  newName = newName.toLowerCase();

  // remove unwanted words
  for (const word of removeWords) {
    newName = newName.replace(word, "");
  }

  // apply removal patterns
  for (const pattern of removePatterns) {
    newName = newName.replace(pattern, " ");
  }

  // convert to title case and trim spaces
  newName = newName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return newName + ".mp3";
}
