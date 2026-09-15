import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JsonWebTokenRepository } from './repositories/jsonwebtoken.repository';
import { JWT_SERVICE, TOKEN_PROVIDER } from './repositories/interfaces/token.interface';

@Global()
@Module({
    providers: [
        {
            provide: JWT_SERVICE,
            useClass: JwtService,
        },
        JsonWebTokenRepository,
        {
            provide: TOKEN_PROVIDER,
            useExisting: JsonWebTokenRepository,
        },
    ],
    exports: [JWT_SERVICE],
})
export class JwtModule { }
