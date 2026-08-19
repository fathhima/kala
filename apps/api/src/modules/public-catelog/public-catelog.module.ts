import { Module } from '@nestjs/common'
import { CategoryModule } from '@/modules/category/category.module'
import { PrismaModule } from '@/shared/prisma/prisma.module'
import { StorageModule } from '@/shared/storage/storage.module'
import { PublicCatalogController } from './public-catelog.controller'
import { PublicCatalogService } from './public-catelog.service'

@Module({
  imports: [PrismaModule, StorageModule, CategoryModule],
  controllers: [PublicCatalogController],
  providers: [PublicCatalogService],
})
export class PublicCatalogModule {}