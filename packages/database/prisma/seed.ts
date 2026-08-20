import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';
import { randomBytes, scrypt as nodeScrypt } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(nodeScrypt);
async function hashPassword(password: string) { const salt = randomBytes(16); const derived = await scrypt(password, salt, 64) as Buffer; return `${salt.toString('hex')}:${derived.toString('hex')}`; }

const adapter = new PrismaMariaDb({ host: process.env.DB_HOST ?? '127.0.0.1', port: Number(process.env.DB_PORT ?? 3306), user: process.env.DB_USER ?? 'root', password: process.env.DB_PASSWORD ?? '', database: process.env.DB_NAME ?? 'oryn', connectionLimit: 5 });
const prisma = new PrismaClient({ adapter });

async function main() {
  const permissionKeys = ['dashboard.read','products.read','products.write','inventory.write','orders.read','orders.write','customers.read','reviews.moderate','discounts.write','returns.write','administrators.write','roles.write','audit.read','settings.write'];
  const permissions = await Promise.all(permissionKeys.map(key => prisma.permission.upsert({ where: { key }, update: {}, create: { key } })));
  const [owner, admin, customer] = await Promise.all([
    prisma.role.upsert({ where: { name: 'Platform Owner' }, update: {}, create: { name: 'Platform Owner' } }),
    prisma.role.upsert({ where: { name: 'Administrator' }, update: {}, create: { name: 'Administrator' } }),
    prisma.role.upsert({ where: { name: 'Customer' }, update: {}, create: { name: 'Customer' } }),
  ]);
  await Promise.all(permissions.map(permission => prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: owner.id, permissionId: permission.id } }, update: {}, create: { roleId: owner.id, permissionId: permission.id } })));
  await prisma.user.upsert({ where: { email: 'admin@oryn.store' }, update: { roleId: admin.id, status: 'ACTIVE' }, create: { email: 'admin@oryn.store', passwordHash: await hashPassword('ChangeMe123!'), firstName: 'Alex', lastName: 'Grant', roleId: admin.id } });
  await prisma.rolePermission.createMany({ data: permissions.slice(0, 10).map(permission => ({ roleId: admin.id, permissionId: permission.id })), skipDuplicates: true });
  const categories = await Promise.all([
    ['Womenswear','womenswear'], ['Menswear','menswear'], ['Accessories','accessories'], ['Objects','objects']
  ].map(([name, slug]) => prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } })));
  const products = [
    { name: 'Sculpted Linen Shirt', slug: 'sculpted-linen-shirt', brand: 'ORYN Studio', categoryId: categories[0].id, price: 145, compareAtPrice: 175, sku: 'ORYN-SLS-01', attributes: { color: 'Natural', size: 'M' }, image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Form Leather Tote', slug: 'form-leather-tote', brand: 'ORYN Objects', categoryId: categories[2].id, price: 220, compareAtPrice: null, sku: 'ORYN-FLT-01', attributes: { color: 'Black' }, image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Axis Minimal Watch', slug: 'axis-minimal-watch', brand: 'ORYN Objects', categoryId: categories[2].id, price: 310, compareAtPrice: 350, sku: 'ORYN-AMW-01', attributes: { strap: 'Leather', color: 'Black' }, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80' },
  ];
  for (const item of products) {
    const product = await prisma.product.upsert({ where: { slug: item.slug }, update: {}, create: { name: item.name, slug: item.slug, brand: item.brand, categoryId: item.categoryId, status: 'ACTIVE', images: { create: { url: item.image, altText: item.name, sortOrder: 0 } }, variants: { create: { sku: item.sku, price: item.price, compareAtPrice: item.compareAtPrice, stockQuantity: 25, attributes: item.attributes, inventory: { create: { quantity: 25 } } } } } });
    console.log(`seeded ${product.name}`);
  }
  await prisma.shippingMethod.createMany({ data: [{ name: 'Standard Delivery', description: '3–5 business days', price: 8, active: true }, { name: 'Express Delivery', description: '1–2 business days', price: 18, active: true }], skipDuplicates: true });
  console.log({ owner: owner.name, admin: admin.name, customer: customer.name });
}
main().catch(console.error).finally(() => prisma.$disconnect());
