declare module '@open-wc/create/dist/core.js' {
  function readFileFromPath(filePath: string): string | false;

  interface Options {
    override?: boolean;
    ask?: boolean;
  }

  function writeFileToPathOnDisk(toPath: string, fileContent: string, obj: Options): void;
}
