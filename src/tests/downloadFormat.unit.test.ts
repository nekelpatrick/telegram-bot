const fs = require("fs").promises; // assuming you're using fs.promises API
import {
  deleteAllFiles,
  downloadSongs,
  extractUrls,
  renameFiles,
} from "../wav-downloader";
import { formatFileName } from "../format-file-name";
import { getFileNames } from "../utils/extractFileNames";

describe("song download and rename process", () => {
  let musicDirectoryPath = "tmp";

  test("should download songs and rename files correctly", async () => {
    // Arrange
    const urlsDirty = `[16/7 11:55] Rodolfo Nekel: https://youtu.be/OIzP4ho4Q_I
    [16/7 11:58] Rodolfo Nekel: https://youtu.be/5XzifsdU7AM
    [16/7 12:04] Rodolfo Nekel: https://youtu.be/Dra-ZOvkuuM
    [17/7 10:34] Rodolfo Nekel: https://youtu.be/LWQb7984Fy8
    [17/7 10:43] Rodolfo Nekel: https://youtu.be/rCgLBUHbJr0
    [17/7 10:46] Rodolfo Nekel: https://youtu.be/2rHSItnuZHo
    [17/7 10:47] Rodolfo Nekel: https://youtu.be/2GO6wdectr8
    [17/7 10:49] Rodolfo Nekel: https://youtu.be/8ul6EljqoPM
    [17/7 10:55] Rodolfo Nekel: https://youtu.be/xIcAr7o3Neo
    [17/7 10:57] Rodolfo Nekel: https://youtu.be/SFhi2GKPxUk
    [17/7 11:01] Rodolfo Nekel: https://youtu.be/_2M3bSl3_ZI
    [17/7 11:06] Rodolfo Nekel: https://youtu.be/rBTwCWuvf-o
    [18/7 09:02] Rodolfo Nekel: https://youtu.be/jVZnBnwR7M0
    [18/7 09:10] Rodolfo Nekel: https://youtu.be/qEDSk-N1wwU
    [18/7 13:17] Rodolfo Nekel: https://youtu.be/YhdqFhCSkPY
    [18/7 13:54] Rodolfo Nekel: https://youtu.be/2LwaDwreIFo
    [18/7 13:56] Rodolfo Nekel: https://youtu.be/TnD9eDgoaWM
    [18/7 13:56] Rodolfo Nekel: https://youtu.be/hB_H2RG66Tw
    [18/7 14:00] Rodolfo Nekel: https://youtu.be/u8eUUq-kFt4`;
    const urls = extractUrls(urlsDirty);

    await downloadSongs(urls);
    const initialFileNames = await getFileNames(musicDirectoryPath);
    // console.log(initialFileNames);
    let files = await fs.readdir(musicDirectoryPath);
    await renameFiles(files);
    const generatedFiles = await getFileNames(musicDirectoryPath);
    // console.log(generatedFiles);

    const expectedRenamedFileNamesArray: string[] = [
      "A Jiripoca Vai Piar - Daniel Original.mp3",
      "As Mocinhas Da Cidade - Nho Belarmino E Nha Gabriela.mp3",
      "Bruno E Marrone - Coracao De Pedra.mp3",
      "Criado Em Galpao - Os Serranos.mp3",
      "Do Outro Lado Da Cidade Dois Passarinhos Ataide E Alexandre Ensaio.mp3",
      "Laco Aberto Ataide E Alexandre Ensaio.mp3",
      "Marcos Roberto - A Ultima Carta.mp3",
      "Mexe Mexe - Leandro E Leonardo.mp3",
      "Milionario E Jose Rico - Pot Pourri.mp3",
      "Moreninha Linda Tonico E Tinoco.mp3",
      "Poutpourri De Vaneira - Barquinho E Garcom Amigo - Grupo Tradicao.mp3",
      "Rosa Branca.mp3",
      "Se Nao Tivesse Ido - Bruno E Marrone.mp3",
      "So Liguei Pra Dizer Que Te Amo.mp3",
      "Vaneira - Nao Chora China Veia De Chao Batido Dancador De Vaneira Quando A Gaita Roncar.mp3",
      "Vaneira 2 - Criado Em Galpao - Cambichos - Campesino.mp3",
      "Vaneirinha Da Saudade.mp3",
      "Voce Nao Sabe Amar - Chico Rey E Parana.mp3",
      "Ze Henrique E Gabriel - Dona Do Meu Destino.mp3",
    ];

    // Assert final file names
    expect(generatedFiles).toEqual(expectedRenamedFileNamesArray);
  });
  afterAll(() => {
    deleteAllFiles(musicDirectoryPath);
  });
});
