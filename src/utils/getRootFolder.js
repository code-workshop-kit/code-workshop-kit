import path from 'path';

export const getRootFolder = appIndex => {
  let rootFolder = '/';
  const suppliedIndex = appIndex;
  if (suppliedIndex && suppliedIndex.indexOf('/') !== -1) {
    const suppliedFolder = suppliedIndex.slice(0, suppliedIndex.lastIndexOf('/') + 1);

    // actual root path that we will use is the root of the server + the folder of the supplied app index
    rootFolder = `${path.resolve('/', suppliedFolder)}/`;
  }
  return rootFolder;
};
