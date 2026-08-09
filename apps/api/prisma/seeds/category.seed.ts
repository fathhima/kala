import { PrismaClient } from '@prisma/client';
import { SeedCategory } from './types/category.type';

const categories: SeedCategory[] = [
    {
        name: 'Art & Craft',
        slug: 'art-and-craft',
        description: 'Creative workshops in art, painting, and handmade craft.',
        sortOrder: 1,
        subcategories: [
            {
                name: 'Watercolor Painting',
                slug: 'watercolor-painting',
                description: 'Watercolor techniques, composition, and projects.',
                sortOrder: 1,
            },
            {
                name: 'Resin Art',
                slug: 'resin-art',
                description: 'Resin art techniques and handmade resin projects.',
                sortOrder: 2,
            },
            {
                name: 'Calligraphy',
                slug: 'calligraphy',
                description: 'Hand lettering, brush lettering, and modern calligraphy.',
                sortOrder: 3,
            },
            {
                name: 'Clay Modelling',
                slug: 'clay-modelling',
                description: 'Handmade clay models, figurines, and decorative pieces.',
                sortOrder: 4,
            },
        ],
    },
    {
        name: 'Beauty & Wellness',
        slug: 'beauty-and-wellness',
        description: 'Creative beauty traditions and wellness-focused skills.',
        sortOrder: 2,
        subcategories: [
            {
                name: 'Mehendi',
                slug: 'mehendi',
                description: 'Traditional and modern henna design techniques.',
                sortOrder: 1,
            },
        ],
    },
    {
        name: 'Handmade & Textile',
        slug: 'handmade-and-textile',
        description: 'Handmade crafts, textile art, and decorative projects.',
        sortOrder: 3,
        subcategories: [
            {
                name: 'Macramé',
                slug: 'macrame',
                description: 'Knotting techniques for wall hangings and accessories.',
                sortOrder: 1,
            },
            {
                name: 'Handmade Crafts',
                slug: 'handmade-crafts',
                description: 'General handmade craft workshops and DIY projects.',
                sortOrder: 2,
            },
        ],
    },
];

export async function seedCategories(prisma: PrismaClient) {
    for (const categoryData of categories) {
        const category = await prisma.category.upsert({
            where: { slug: categoryData.slug },
            update: {
                name: categoryData.name,
                description: categoryData.description,
                sortOrder: categoryData.sortOrder,
                isActive: true,
            },
            create: {
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                sortOrder: categoryData.sortOrder,
                isActive: true,
            },
        });

        for (const subcategoryData of categoryData.subcategories) {
            await prisma.subcategory.upsert({
                where: {
                    categoryId_slug: {
                        categoryId: category.id,
                        slug: subcategoryData.slug,
                    },
                },
                update: {
                    name: subcategoryData.name,
                    description: subcategoryData.description,
                    sortOrder: subcategoryData.sortOrder,
                    isActive: true,
                },
                create: {
                    categoryId: category.id,
                    name: subcategoryData.name,
                    slug: subcategoryData.slug,
                    description: subcategoryData.description,
                    sortOrder: subcategoryData.sortOrder,
                    isActive: true,
                },
            });
        }
    }
    
    console.log('✅ Categories seeded');
}