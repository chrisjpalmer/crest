import * as fs from 'fs';
import * as path from 'path';
import { FieldType } from './entity.class';
import { PropertyDeclaration, ObjectLiteralExpression } from 'ts-simple-ast';
const snake = require('to-snake-case');
const shell = require('shelljs');

export var templatePath: string = 'up/template';
export var appRoutesPath: string = 'src/app/routes';

export function snakeCase(input: string): string {
  return snake(input);
}

export function dotCase(input: string): string {
  return snakeCase(input).replaceAll('_', '.');
}

export function toUpperTitleCase(str: string) {
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1);
  });
}

export function toLowerTitleCase(str: string) {
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toLowerCase() + txt.substr(1);
  });
}

export function toPlural(str: string) {
  return str + '(s)';
}

export function readFilePromise(fileLocation: string): Promise<string> {
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

export function makeDirectoryPromise(directoryLocation: string): Promise<void> {
  let makeDirectoryPromise = new Promise<void>((resolve, reject) => {
    fs.mkdir(directoryLocation, err => {
      if (err != null) {
        reject(err);
      }

      resolve();
    });
  });
  return makeDirectoryPromise;
}

export function mkdirRecursive(directoryLocation) {
  shell.mkdir('-p', directoryLocation);
}

export function writeFilePromise(
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

export function toMap(object: any): Map<string, string> {
  let map = new Map<string, string>();
  Object.keys(object).forEach(key => {
    map.set(key, object[key]);
  });
  return map;
}

export function replaceByObject(input: string, object: any): string {
  let toReplace: Map<string, string> = toMap(object);
  let output = input;
  toReplace.forEach((value, key) => {
    output = output.replaceAll(key, value);
  });

  return output;
}

export function fieldTypeToString(fieldType: FieldType) {
  switch (fieldType) {
    case FieldType.Number:
      return 'number';
    case FieldType.Boolean:
      return 'boolean';
    case FieldType.String:
      return 'string';
  }

  return null;
}

export function fieldTypeToValidator(fieldType: FieldType) {
  switch (fieldType) {
    case FieldType.Number:
      return '@IsNumber()';
    case FieldType.Boolean:
      return '@IsBoolean()';
    case FieldType.String:
      return '@IsString()';
  }

  return null;
}

export function hasUniqueIndex(n: PropertyDeclaration) {
  let indexDecorator = n.getDecorator('Index');
  if (!indexDecorator) {
    return false;
  }
  let oneArgumentContainsATrueUniqueProperty = indexDecorator.getArguments().some((arg:ObjectLiteralExpression) =>  {
    let uniqueProperty = arg.getProperty('unique');
    if(!uniqueProperty){
      return false;
    }

    if(uniqueProperty.getText().indexOf('true') === -1) {
      return false;
    }

    return true;
  });
  if(!oneArgumentContainsATrueUniqueProperty) {
    return false;
  }
  return true;
}

export function RunFormatter() {
  shell.exec('npm run format', { async: false });
}
