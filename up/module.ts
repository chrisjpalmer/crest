import Project, { ObjectLiteralExpression } from 'ts-simple-ast';
import { Name, Route } from './util/util';

export async function AddToModule(
  name:Name,
  route:Route,
  destination:string,
) {
  let project = new Project();
  let moduleFile = project.addExistingSourceFile(`src/app/app.module.ts`);
  moduleFile.addImportDeclaration({
    namedImports: [`${name.upper()}Controller`],
    moduleSpecifier: `${destination}/${name.dot()}.controller`,
  });

  let appModuleClass = moduleFile.getClassOrThrow('AppModule');
  let appModuleDecorator = appModuleClass.getDecoratorOrThrow('Module');
  let args = appModuleDecorator.getArguments();
  let moduleConfig = <ObjectLiteralExpression>args[0];

  addToControllersArray(moduleConfig, name, route);

  await project.save();
}

export function addToControllersArray(
  moduleConfig: ObjectLiteralExpression,
  name:Name,
  route:Route,
) {
  let controllersConfig = moduleConfig.getPropertyOrThrow('controllers');
  let originalStatement = controllersConfig.getText();
  let closingArrayBracket = originalStatement.indexOf(']');
  let topArrayExpression = originalStatement.substr(0, closingArrayBracket);
  let bottomArrayExpression = originalStatement.substr(
    closingArrayBracket,
    originalStatement.length - closingArrayBracket,
  );

  //Form the new statement
  let newStatement =
`${topArrayExpression}
  // /${route.full()}
${name.upper}Controller,
${name.upper}SyncController
${bottomArrayExpression}`;
  controllersConfig.replaceWithText(newStatement);
}