import { formatFileName } from "../format-file-name";

describe("formatFileName", () => {
  test("should convert to title case", () => {
    const input = "quem ama sempre entende - henrique e juliano.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Quem Ama Sempre Entende - Henrique E Juliano.mp3");
  });

  test('should remove trailing " - " before extension', () => {
    const input = "desatino - daniel -.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Desatino - Daniel.mp3");
  });

  test("should replace & with 'e'", () => {
    const input = "lu & robertinho.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Lu E Robertinho.mp3");
  });

  test("should remove characters like parentheses", () => {
    const input = "agora (ao vivo).mp3";
    const output = formatFileName(input);
    expect(output).toBe("Agora Ao Vivo.mp3");
  });

  test("should remove = signs", () => {
    const input = "musica=vida.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Musicavida.mp3");
  });

  test("should remove trailing numbers", () => {
    const input = "musica 1988.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Musica.mp3");
  });

  test("should remove multiple spaces", () => {
    const input = "musica   legal.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Musica Legal.mp3");
  });

  test("should remove unwanted words", () => {
    const input = "musica karaoke oficial.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Musica.mp3");
  });

  test("should normalize special characters", () => {
    const input = "caminhos ⧸ marilia mendonça.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Caminhos Marilia Mendonca.mp3");
  });

  test("should remove multiple dots", () => {
    const input = "musica . . ..mp3";
    const output = formatFileName(input);
    expect(output).toBe("Musica.mp3");
  });

  test("should remove Latin accents", () => {
    const input = "Coração & Paixão.mp3";
    const output = formatFileName(input);
    expect(output).toBe("Coracao E Paixao.mp3");
  });

  describe("formatFileName", () => {
    test("should remove multiple hyphens", () => {
      const input = "duplo--hífen-música.mp3";
      const output = formatFileName(input);
      expect(output).toBe("Duplo hifen musica.mp3");
    });

    test("should handle file with no extension", () => {
      const input = "música sem extensão";
      const output = formatFileName(input);
      expect(output).toBe("Musica Sem Extensao");
    });

    test("should handle title with numeric words", () => {
      const input = "música 123 título.mp3";
      const output = formatFileName(input);
      expect(output).toBe("Musica 123 Titulo.mp3");
    });

    test("should handle file with different extension", () => {
      const input = "título-música.wav";
      const output = formatFileName(input);
      expect(output).toBe("Titulo musica.wav");
    });

    // test("should handle title with special characters", () => {
    //   const input = "@música #especial $título%.mp3";
    //   const output = formatFileName(input);
    //   expect(output).toBe("Musica especial titulo.mp3");
    // });

    test("should handle title with multiple spaces", () => {
      const input = "demasiado   espaço   entre   palavras.mp3";
      const output = formatFileName(input);
      expect(output).toBe("Demasiado Espaco Entre Palavras.mp3");
    });

    test("should remove special youtube words", () => {
      const input = "música oficial playback karaoke.mp3";
      const output = formatFileName(input);
      expect(output).toBe("Musica.mp3");
    });

    test("should handle title with underscore", () => {
      const input = "música_com_sublinhado.mp3";
      const output = formatFileName(input);
      expect(output).toBe("Musica com sublinhado.mp3");
    });

    test("should handle all uppercase title", () => {
      const input = "MÚSICA EM MAIÚSCULAS.mp3";
      const output = formatFileName(input);
      expect(output).toBe("Musica Em Maiusculas.mp3");
    });

    test("should handle all lowercase title", () => {
      const input = "música em minúsculas.mp3";
      const output = formatFileName(input);
      expect(output).toBe("Musica Em Minusculas.mp3");
    });
  });
});
