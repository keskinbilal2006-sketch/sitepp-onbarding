import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';

import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

const testEmail = `auth-flow-${Date.now()}@sitepp.test`;
let baseUrl = '';
let server: ReturnType<typeof app.listen>;

const requestJson = async <T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {},
): Promise<{ status: number; body: T }> => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return {
    status: response.status,
    body: (await response.json()) as T,
  };
};

describe('auth flow integration', () => {
  before(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });

    server = app.listen(0);
    await new Promise<void>((resolve) => {
      server.once('listening', resolve);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    await prisma.$disconnect();
  });

  it('registers, logs in, and reads the protected current user endpoint', async () => {
    const register = await requestJson<{
      user: { id: string; email: string; role: string };
      tokens: { accessToken: string; refreshToken: string };
    }>('/api/auth/register', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'Sitepp123',
        name: 'Integration User',
        apartmentNo: 'T-1',
      },
    });

    assert.equal(register.status, 201);
    assert.equal(register.body.user.email, testEmail);
    assert.equal(register.body.user.role, 'RESIDENT');
    assert.ok(register.body.tokens.accessToken);
    assert.ok(register.body.tokens.refreshToken);

    const meWithRegisterToken = await requestJson<{ email: string }>('/api/auth/me', {
      token: register.body.tokens.accessToken,
    });

    assert.equal(meWithRegisterToken.status, 200);
    assert.equal(meWithRegisterToken.body.email, testEmail);

    const login = await requestJson<{
      user: { email: string };
      tokens: { accessToken: string; refreshToken: string };
    }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'Sitepp123',
      },
    });

    assert.equal(login.status, 200);
    assert.equal(login.body.user.email, testEmail);
    assert.ok(login.body.tokens.accessToken);
    assert.ok(login.body.tokens.refreshToken);

    const meWithLoginToken = await requestJson<{ email: string }>('/api/auth/me', {
      token: login.body.tokens.accessToken,
    });

    assert.equal(meWithLoginToken.status, 200);
    assert.equal(meWithLoginToken.body.email, testEmail);
  });
});
