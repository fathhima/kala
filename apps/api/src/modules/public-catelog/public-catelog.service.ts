import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  InstructorProfileStatus,
  OfferingStatus,
  Prisma,
} from '@prisma/client'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { StorageService } from '@/shared/storage/storage.service'
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '@/modules/category/repositories/interfaces/category.repository'
import { PaginationMetaDto } from '@/shared/dto/response/pagination-meta.dto'
import { PublicCategoryDto, PublicInstructorDto } from './dto/response/public-catelog-response.dto'
import { PublicInstructorQueryDto } from './dto/request/public-instructor-query.dto'


const publicProfileInclude = {
  user: {
    select: {
      name: true,
      imageUrl: true,
    },
  },
  offerings: {
    where: {
      status: OfferingStatus.APPROVED,
    },
    include: {
      subcategory: {
        include: {
          category: true,
        },
      },
      media: {
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.InstructorProfileInclude

type PublicProfile = Prisma.InstructorProfileGetPayload<{
  include: typeof publicProfileInclude
}>

@Injectable()
export class PublicCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getCategories(): Promise<PublicCategoryDto[]> {
    const categories = await this.categoryRepository.findSelectable()

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      subcategories: category.subcategories.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description,
      })),
    }))
  }

  async getInstructors(query: PublicInstructorQueryDto) {
    const where = this.buildWhere(query)
    const skip = (query.page - 1) * query.limit

    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.instructorProfile.findMany({
        where,
        skip,
        take: query.limit,
        include: publicProfileInclude,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.instructorProfile.count({ where }),
    ])

    return {
      items: await Promise.all(profiles.map((profile) => this.toPublicInstructor(profile))),
      meta: PaginationMetaDto.create(query.page, query.limit, total),
    }
  }

  async getInstructor(profileId: string): Promise<PublicInstructorDto> {
    const profile = await this.prisma.instructorProfile.findFirst({
      where: {
        id: profileId,
        status: InstructorProfileStatus.APPROVED,
        offerings: {
          some: {
            status: OfferingStatus.APPROVED,
          },
        },
      },
      include: publicProfileInclude,
    })

    if (!profile) {
      throw new NotFoundException('Instructor not found')
    }

    return this.toPublicInstructor(profile)
  }

  private buildWhere(
    query: PublicInstructorQueryDto,
  ): Prisma.InstructorProfileWhereInput {
    const where: Prisma.InstructorProfileWhereInput = {
      status: InstructorProfileStatus.APPROVED,
      offerings: {
        some: {
          status: OfferingStatus.APPROVED,
          ...(query.subcategoryId
            ? { subcategoryId: query.subcategoryId }
            : {}),
        },
      },
    }

    const search = query.search?.trim()

    if (search) {
      where.AND = [
        {
          OR: [
            {
              user: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              bio: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              offerings: {
                some: {
                  status: OfferingStatus.APPROVED,
                  OR: [
                    {
                      title: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      description: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      ]
    }

    return where
  }

  private async toPublicInstructor(
    profile: PublicProfile,
  ): Promise<PublicInstructorDto> {
    return {
      id: profile.id,
      name: profile.user.name,
      imageUrl: profile.user.imageUrl,
      bio: profile.bio,
      location: profile.location,
      offerings: await Promise.all(
        profile.offerings.map(async (offering) => ({
          id: offering.id,
          title: offering.title,
          description: offering.description,
          hourlyRate: offering.hourlyRate.toString(),
          currency: offering.currency,
          experienceYears: offering.experienceYears,
          subcategory: {
            id: offering.subcategory.id,
            name: offering.subcategory.name,
            slug: offering.subcategory.slug,
            category: {
              id: offering.subcategory.category.id,
              name: offering.subcategory.category.name,
              slug: offering.subcategory.category.slug,
            },
          },
          media: await Promise.all(
            offering.media.map(async (media) => {
              const download = await this.storageService.createDownloadUrl({
                key: media.storageKey,
                expiresInSeconds: 900,
              })

              return {
                id: media.id,
                type: media.type,
                viewUrl: download.viewUrl,
              }
            }),
          ),
        })),
      ),
    }
  }
}