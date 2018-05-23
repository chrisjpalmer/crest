import Project, { ObjectLiteralExpression } from 'ts-simple-ast';
import { Entity } from './entity.class';

export async function AddToModule(
  controllerPath: string,
  entityFilename: string,
  entity: Entity,
) {
  let project = new Project();
  let moduleFile = project.addExistingSourceFile(`src/app/app.module.ts`);
  moduleFile.addImportDeclaration({
    namedImports: [`${entity.upper}Controller`],
    moduleSpecifier: `./routes/authenticated/${controllerPath}/${entityFilename}.controller`,
  });
  moduleFile.addImportDeclaration({
    namedImports: [`${entity.upper}Service`],
    moduleSpecifier: `./routes/authenticated/${controllerPath}/${entityFilename}.service`,
  });

  let appModuleClass = moduleFile.getClassOrThrow('AppModule');
  let appModuleDecorator = appModuleClass.getDecoratorOrThrow('Module');
  let args = appModuleDecorator.getArguments();
  let moduleConfig = <ObjectLiteralExpression>args[0];

  addToControllersArray(moduleConfig, entity, controllerPath, entityFilename);
  addToComponentsArray(moduleConfig, entity);

  await project.save();
}

export function addToControllersArray(
  moduleConfig: ObjectLiteralExpression,
  entity: Entity,
  controllerPath: string,
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
    `\n    // /authenticated/${controllerPath}\n    ${
      entity.upper
    }Controller,\n` +
    bottomArrayExpression;
  controllersConfig.replaceWithText(newStatement);
}

export function addToComponentsArray(
  moduleConfig: ObjectLiteralExpression,
  entity: Entity,
) {
  let controllersConfig = moduleConfig.getPropertyOrThrow('components');
  let originalStatement = controllersConfig.getText();
  let comma = "";

  if(originalStatement !== '[]') {
    comma = ","
  }

  let closingArrayBracket = originalStatement.indexOf(']');
  let topArrayExpression = originalStatement.substr(0, closingArrayBracket);
  let bottomArrayExpression = originalStatement.substr(
    closingArrayBracket,
    originalStatement.length - closingArrayBracket,
  );
  let newStatement =
    topArrayExpression + comma + `${entity.upper}Service` + bottomArrayExpression;
  controllersConfig.replaceWithText(newStatement);
}
