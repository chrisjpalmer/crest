import * as fs from 'fs';
import * as path from 'path';
const shell = require('shelljs');
const prompt = require('prompt');
const colors = require('colors/safe');

function readFilePromise(fileLocation: string): Promise<string> {
  let fileReadPromise = new Promise<string>((resolve, reject) => {
    fs.readFile(fileLocation, 'utf8', (err, data) => {
      if (err != null) {
        reject(err);
      }

      resolve(data);
    });
  });
  return fileReadPromise;
}

function writeFilePromise(
  fileLocation: string,
  contents: string,
): Promise<void> {
  let writeFilePromise = new Promise<void>((resolve, reject) => {
    fs.writeFile(fileLocation, contents, err => {
      if (err != null) {
        reject(err);
      }

      resolve();
    });
  });
  return writeFilePromise;
}

function promptPromise(prompts: any[]): any {
  return new Promise((resolve, reject) => {
    prompt.get(prompts, function(err, result) {
      if (err != null) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

async function main() {
  let gitUrl: string = '';
  let cwd: string = process.cwd();


  //Get command line arguments
  prompt.start();

  let prompt1 = await promptPromise([
    {
      properties: {
        gitUrl: {
          description: colors.magenta(
            'Do you want to link the project to a git url? Y/n',
          ),
        },
      },
    },
  ]);

  if (prompt1.gitUrl === 'Y' || prompt1.gitUrl === 'y') {
    let prompt2 = await promptPromise([
      {
        properties: {
          gitUrl: {
            description: colors.magenta('Url:'),
          },
        },
      },
    ]);

    gitUrl = prompt2.gitUrl;
  }

  //git remote
  console.log(`removing git remote and setting to ${gitUrl}`);
  shell.exec(`git remote set-url origin ${gitUrl}`, { async: false });

  //copy config
  console.log(`generating config/config.json and config/key.pem`);
  fs.copyFileSync(
    `${cwd}/config/template/config.template.json`,
    `${cwd}/config/config.json`,
  );
  fs.copyFileSync(`${cwd}/config/template/key.template.pem`, `${cwd}/config/key.pem`);

  //config.json
  let configJSON = await readFilePromise(`${cwd}/config/config.json`);
  let configJSONData = JSON.parse(configJSON);
  configJSONData.auth.keyPath = path.join(cwd, 'config', 'config.json');
  await writeFilePromise(
    `${cwd}/config/config.json`,
    JSON.stringify(configJSONData),
  );

  //package.json
  console.log('added `npm run start` to package.json');
  let packageJSON = await readFilePromise(`${cwd}/package.json`);
  let packageJSONData = JSON.parse(packageJSON);
  packageJSONData.scripts.start = `ts-node -r tsconfig-paths/register src/main.ts --config=\"${path.join(
    cwd,
    'package.json',
  )}\"`;
  await writeFilePromise(
    `${cwd}/package.json`,
    JSON.stringify(packageJSONData),
  );
}

main();
