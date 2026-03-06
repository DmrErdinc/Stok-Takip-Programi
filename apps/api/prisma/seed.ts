import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
// Role is a string: 'ADMIN' | 'CASHIER' | 'AUDITOR'

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ── Users ────────────────────────────────────
    const adminPassword = await bcrypt.hash('admin123', 10);
    const cashierPassword = await bcrypt.hash('kasiyer123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@stoktakip.com' },
        update: {},
        create: {
            email: 'admin@stoktakip.com',
            password: adminPassword,
            name: 'Sistem Admin',
            role: 'ADMIN',
        },
    });

    const cashier = await prisma.user.upsert({
        where: { email: 'kasiyer@stoktakip.com' },
        update: {},
        create: {
            email: 'kasiyer@stoktakip.com',
            password: cashierPassword,
            name: 'Kasiyer Mehmet',
            role: 'CASHIER',
        },
    });

    console.log('✅ Users created');

    // ── Categories ───────────────────────────────
    const elektronik = await prisma.category.upsert({
        where: { name: 'Elektronik' },
        update: {},
        create: { name: 'Elektronik' },
    });

    const gida = await prisma.category.upsert({
        where: { name: 'Gıda' },
        update: {},
        create: { name: 'Gıda' },
    });

    const kirtasiye = await prisma.category.upsert({
        where: { name: 'Kırtasiye' },
        update: {},
        create: { name: 'Kırtasiye' },
    });

    const giyim = await prisma.category.upsert({
        where: { name: 'Giyim' },
        update: {},
        create: { name: 'Giyim' },
    });

    console.log('✅ Categories created');

    // ── Products + Barcodes ──────────────────────
    const products = [
        {
            sku: 'ELK-001',
            name: 'Samsung Galaxy Kulaklık',
            categoryId: elektronik.id,
            brand: 'Samsung',
            salePrice: 499.90,
            costPrice: 320.00,
            minStock: 10,
            shelfLocation: 'A-1-01',
            barcodes: [{ code: '8690000000001', label: 'Ana Barkod' }],
        },
        {
            sku: 'ELK-002',
            name: 'Logitech Mouse M220',
            categoryId: elektronik.id,
            brand: 'Logitech',
            salePrice: 349.90,
            costPrice: 200.00,
            minStock: 5,
            shelfLocation: 'A-1-02',
            barcodes: [{ code: '8690000000002', label: 'Ana Barkod' }],
        },
        {
            sku: 'ELK-003',
            name: 'Anker PowerBank 10000mAh',
            categoryId: elektronik.id,
            brand: 'Anker',
            salePrice: 699.90,
            costPrice: 450.00,
            minStock: 3,
            shelfLocation: 'A-2-01',
            barcodes: [{ code: '8690000000003', label: 'Ana Barkod' }],
        },
        {
            sku: 'GDA-001',
            name: 'Ülker Çikolata 80g',
            categoryId: gida.id,
            brand: 'Ülker',
            salePrice: 24.90,
            costPrice: 16.00,
            minStock: 50,
            shelfLocation: 'B-1-01',
            barcodes: [{ code: '8690000000004', label: 'Ana Barkod' }, { code: '8690000000014', label: 'Koli Barkod' }],
        },
        {
            sku: 'GDA-002',
            name: 'Nescafe 3ü1 Arada 10lu',
            categoryId: gida.id,
            brand: 'Nescafe',
            salePrice: 89.90,
            costPrice: 60.00,
            minStock: 20,
            shelfLocation: 'B-1-02',
            barcodes: [{ code: '8690000000005', label: 'Ana Barkod' }],
        },
        {
            sku: 'KRT-001',
            name: 'Faber-Castell Kurşun Kalem 12li',
            categoryId: kirtasiye.id,
            brand: 'Faber-Castell',
            salePrice: 59.90,
            costPrice: 35.00,
            minStock: 15,
            shelfLocation: 'C-1-01',
            barcodes: [{ code: '8690000000006', label: 'Ana Barkod' }],
        },
        {
            sku: 'KRT-002',
            name: 'A4 Fotokopi Kağıdı 500lü',
            categoryId: kirtasiye.id,
            brand: 'Navigator',
            salePrice: 129.90,
            costPrice: 85.00,
            minStock: 10,
            shelfLocation: 'C-2-01',
            barcodes: [{ code: '8690000000007', label: 'Ana Barkod' }],
        },
        {
            sku: 'GYM-001',
            name: 'Erkek Basic T-Shirt Beyaz L',
            categoryId: giyim.id,
            brand: 'BasicWear',
            salePrice: 199.90,
            costPrice: 80.00,
            minStock: 5,
            shelfLocation: 'D-1-01',
            variant: JSON.stringify({ renk: 'Beyaz', beden: 'L' }),
            barcodes: [{ code: '8690000000008', label: 'Ana Barkod' }],
        },
    ];

    for (const p of products) {
        const { barcodes, ...productData } = p;
        await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: {
                ...productData,
                vatRate: 18,
                barcodes: { create: barcodes },
            },
        });
    }

    console.log('✅ Products + Barcodes created');

    // ── Supplier ─────────────────────────────────
    await prisma.supplier.upsert({
        where: { id: 'seed-supplier-1' },
        update: {},
        create: {
            id: 'seed-supplier-1',
            name: 'ABC Toptan',
            phone: '0212 555 1234',
            email: 'info@abctoptan.com',
            address: 'İstanbul, Bağcılar',
            taxNumber: '1234567890',
        },
    });

    console.log('✅ Suppliers created');

    // ── Initial Stock (IN movements) ─────────────
    const allProducts = await prisma.product.findMany();
    const stockQuantities: Record<string, number> = {
        'ELK-001': 25,
        'ELK-002': 8,
        'ELK-003': 3,  // Will be critical (minStock = 3)
        'GDA-001': 100,
        'GDA-002': 15, // Will be critical (minStock = 20)
        'KRT-001': 30,
        'KRT-002': 5,  // Will be critical (minStock = 10)
        'GYM-001': 12,
    };

    const stockMove = await prisma.stockMove.create({
        data: {
            documentNo: 'GRS-SEED-0001',
            type: 'IN',
            reason: 'PURCHASE',
            description: 'Başlangıç stok girişi',
            userId: admin.id,
            lines: {
                create: allProducts.map((p) => ({
                    productId: p.id,
                    quantity: stockQuantities[p.sku] || 10,
                    unitCost: p.costPrice,
                })),
            },
        },
    });

    console.log('✅ Initial stock movements created');
    console.log('');
    console.log('🎉 Seeding completed!');
    console.log('');
    console.log('📋 Login credentials:');
    console.log('   Admin:   admin@stoktakip.com / admin123');
    console.log('   Kasiyer: kasiyer@stoktakip.com / kasiyer123');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
