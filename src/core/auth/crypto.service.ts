/** BOILERPLATE - don't touch unless you are brave */
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '../service/config.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  constructor(private readonly configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    let genHash = new Promise<string>((resolve, reject) => {
      bcrypt.hash(password, this.configService.auth.saltRounds, function(
        err,
        hash: string,
      ) {
        if (err !== undefined) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });

    let hash = '';
    try {
      hash = await genHash;
    } catch (e) {
      throw new BadRequestException(
        'error occurred while trying to derive password hash',
      );
    }
    return hash;
  }

  async validatePassword(hash: string, password: string): Promise<boolean> {
    let validate = new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(password, hash, function(err, res) {
        if (err !== undefined) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    let result = false;
    try {
      result = await validate;
    } catch (e) {
      throw new InternalServerErrorException(
        'error occurred while trying to compare the password hash',
      );
    }

    return result;
  }
}
