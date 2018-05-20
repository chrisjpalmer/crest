/** BOILERPLATE - don't touch unless you are brave */
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  validate,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class Database {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString() password: string;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber() port: number;

  @IsString()
  @IsNotEmpty()
  schema: string;
}

class Auth {
  @IsString()
  @IsNotEmpty()
  keyPath: string;

  key: string; //Filled in by the config service upon init()

  @IsNumber() expiry: number;

  @IsNumber() saltRounds: number;
}

class App {
  @IsBoolean()
  @IsNotEmpty()
  debug: boolean;
}

export class ConfigData {
  @ValidateNested()
  @Type(() => Database) //This line is necessary to allow class-transformer to properly transform sub objects for validation
  database: Database;

  @ValidateNested()
  @Type(() => Auth)
  auth: Auth;

  @ValidateNested()
  @Type(() => App)
  app: App;
}
