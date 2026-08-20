export type AuthUser = { id: string; email: string; firstName: string; lastName: string; status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; role: { name: string } };
export type AuthTokens = { accessToken: string; refreshToken: string };
