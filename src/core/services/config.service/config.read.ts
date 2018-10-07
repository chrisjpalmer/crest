/** BOILERPLATE - don't touch unless you are brave */
import { readFile } from 'fs';
import { ConfigData } from './config.class';
import { transformAndValidate } from 'class-transformer-validator';

function readFilePromise(fileLocation: string): Promise<string> {
  let fileReadPromise = new Promise<string>((resolve, reject) => {
    readFile(fileLocation, 'utf8', (err, data) => {
      if (err != null) {
        reject(err);
      }

      resolve(data);
    });
  });
  return fileReadPromise;
}

export async function ConfigParse(fileLocation: string) {
  //Read the file
  console.log('Reading config file: ' + fileLocation);
  let data = await readFilePromise(fileLocation);

  //Parse into json
  console.log('Parsing config file');
  let rawObject = JSON.parse(data);

  //Validate the config file
  console.log('Validating config file');
  let validatedData = <ConfigData>await transformAndValidate(
    ConfigData,
    rawObject,
  );

  //Resolve key paths
  //TODO: do this with decorators:
  validatedData.auth.key = await readFilePromise(validatedData.auth.keyPath);

  //Set the config data within the global object
  //TODO: Use a constant string
  global['config'] = validatedData;
}
