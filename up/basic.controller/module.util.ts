import Project, { ObjectLiteralExpression } from 'ts-simple-ast';
import { Entity } from '../util/entity.class';

export async function AddToModule(
  path: string,  
  apiUpper:string,
  apiDot:string
) {
  let project = new Project();
  let moduleFile = project.addExistingSourceFile(`src/app/app.module.ts`);
  moduleFile.addImportDeclaration({
    namedImports: [`${apiUpper}Controller`, `${apiUpper}SyncController`],
    moduleSpecifier: `./routes/${path}/${apiDot}.controller`,
  });

  let appModuleClass = moduleFile.getClassOrThrow('AppModule');
  let appModuleDecorator = appModuleClass.getDecoratorOrThrow('Module');
  let args = appModuleDecorator.getArguments();
  let moduleConfig = <ObjectLiteralExpression>args[0];

  addToControllersArray(moduleConfig, path, apiUpper);

  await project.save();
}

export function addToControllersArray(
  moduleConfig: ObjectLiteralExpression,
  path: string,
  apiUpper:string
) {
  let controllersConfig = moduleConfig.getPropertyOrThrow('controllers');
  let originalStatement = controllersConfig.getText();
  let closingArrayBracket = originalStatement.indexOf(']');
  let topArrayExpression = originalStatement.substr(0, closingArrayBracket);
  let bottomArrayExpression = originalStatement.substr(
    closingArrayBracket,
    originalStatement.length - closingArrayBracket,
  );
  let newStatement =
    topArrayExpression +
    `\n    // /${path}\n    ${
      apiUpper
    }Controller,\n` +
    bottomArrayExpression;
  controllersConfig.replaceWithText(newStatement);
}