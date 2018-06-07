import { IsString, IsNotEmpty } from 'class-validator';

//------------------------------------------------
//--------------------- CLASS --------------------
//------------------------------------------------

//-----------POST----------\\

//Input
export class PostInput {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

//Output
export class PostOutput {
  token: string;
}
