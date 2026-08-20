import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({ host: process.env.DB_HOST ?? '127.0.0.1', port: Number(process.env.DB_PORT ?? 3306), user: process.env.DB_USER ?? 'root', password: process.env.DB_PASSWORD ?? '', database: process.env.DB_NAME ?? 'oryn', connectionLimit: 5 });
const prisma = new PrismaClient({ adapter });
async function main() {
  const keys = ['dashboard.read','products.read','products.write','inventory.write','orders.read','orders.write','customers.read','reviews.moderate','discounts.write','returns.write','administrators.write','roles.write','audit.read','settings.write'];
  for (const key of keys) await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  const role = await prisma.role.upsert({ where: { name: 'Platform Owner' }, update: {}, create: { name: 'Platform Owner' } });
  const permissions = await prisma.permission.findMany();
  for (const permission of permissions) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
  await prisma.category.upsert({ where: { slug: 'new-arrivals' }, update: {}, create: { name: 'New Arrivals', slug: 'new-arrivals' } });
}
main().finally(() => prisma.$disconnect());
