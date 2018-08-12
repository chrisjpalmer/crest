import Project, { ObjectLiteralExpression } from 'ts-simple-ast';
import { Entity } from '../util/entity.class';

export async function AddToModule(
  path: string,
  entityFilename: string,
  entity: Entity,
) {
  let project = new Project();
  let moduleFile = project.addExistingSourceFile(`src/app/app.module.ts`);
  moduleFile.addImportDeclaration({
    namedImports: [`${entity.upper}Controller`, `${entity.upper}SyncController`],
    moduleSpecifier: `./routes/${path}/${entityFilename}.controller`,
  });

  let appModuleClass = moduleFile.getClassOrThrow('AppModule');
  let appModuleDecorator = appModuleClass.getDecoratorOrThrow('Module');
  let args = appModuleDecorator.getArguments();
  let moduleConfig = <ObjectLiteralExpression>args[0];

  addToControllersArray(moduleConfig, entity, path, entityFilename);

  await project.save();
}

export function addToControllersArray(
  moduleConfig: ObjectLiteralExpression,
  entity: Entity,
  path: string,
  entityFilename: string,
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
      entity.upper
    }Controller,\n` +
    bottomArrayExpression;
  controllersConfig.replaceWithText(newStatement);
}