import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '@oryn/database';
import { AppError } from '../../common/http';
import { createAccessToken, createRefreshToken, decodeRefreshToken } from '../../services/tokenService';

const scrypt = promisify(nodeScrypt);
async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}
async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const derived = await scrypt(password, Buffer.from(saltHex, 'hex'), 64) as Buffer;
  return timingSafeEqual(derived, Buffer.from(hashHex, 'hex'));
}

export async function register(input: { firstName: string; lastName: string; email: string; password: string }) {
  const email = input.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists.');
  const role = await prisma.role.findUnique({ where: { name: 'Customer' } }) ?? await prisma.role.create({ data: { name: 'Customer' } });
  const user = await prisma.user.create({ data: { firstName: input.firstName, lastName: input.lastName, email, passwordHash: await hashPassword(input.password), roleId: role.id } });
  await prisma.notificationPreference.create({ data: { userId: user.id } });
  return issue(user.id, role.name);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) throw new AppError(400, 'INVALID_CURRENT_PASSWORD', 'Current password is incorrect.');
  if (currentPassword === newPassword) throw new AppError(400, 'PASSWORD_UNCHANGED', 'Choose a different password.');
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
}

export async function login(emailInput: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: emailInput.toLowerCase() }, include: { role: true } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  if (user.status !== 'ACTIVE') throw new AppError(403, 'ACCOUNT_INACTIVE', 'This account is not active.');
  return issue(user.id, user.role.name);
}

export async function refresh(refreshToken: string) {
  try {
    const payload = decodeRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
    if (!user || user.status !== 'ACTIVE') throw new Error('invalid');
    return issue(user.id, user.role.name);
  } catch { throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.'); }
}

async function issue(userId: string, role: string) {
  return { accessToken: createAccessToken({ id: userId, role }), refreshToken: createRefreshToken(userId) };
}
