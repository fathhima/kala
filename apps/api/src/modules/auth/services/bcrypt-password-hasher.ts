import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../services/interfaces/password-hasher.interface';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
    hash(plain: string) {
        return bcrypt.hash(plain, 10);
    }

    compare(plain: string, hashed: string) {
        return bcrypt.compare(plain, hashed);
    }
}