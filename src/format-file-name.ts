export function formatFileName(fileName: string) {
  const nameRegex =
    /^(.+?)(?: - [^[]+)?(?: - [\w\s]+)?(?: \[\w+\])?(?:\.[\w\d]+)?$/;
  const match = nameRegex.exec(fileName);

  if (match) {
    let newName = match[1]
      .toLowerCase()
      .replace(/karaoke/g, "") // remove 'karaoke'
      .replace(/playback/g, "") // remove 'playback'
      .replace(/oficial/g, "") // remove 'oficial'
      .replace(/qualidade/g, "") // remove 'qualidade'
      .replace(/melhor/g, "") // remove 'melhor'
      .replace(/\d+/g, "") // remove numbers
      .replace(/[-_=+]/g, " ") // replace '-_=+' with ' '
      .replace(/[^\w\s]/gi, "") // remove special characters
      .replace(/\s*\.\s*$/, "") // remove trailing '.'
      .replace(/\s*-\s*$/, "") // remove trailing '-'
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return newName + ".mp3";
  }

  return fileName;
}
