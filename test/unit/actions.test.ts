import { AuthService } from '@/lib/services/auth.service'

describe('AuthService Logic', () => {
  let service: AuthService

  beforeEach(() => {
    service = new AuthService()
  })

  it('rejects invalid password credentials', async () => {
    await expect(
      service.login({
        emailOrUsername: 'superadmin',
        password: 'WrongPassword!',
      })
    ).rejects.toThrow('Invalid username/email or password')
  })

  it('registers new user with status pending', async () => {
    const randomUser = `testuser_${Date.now()}`
    const result = await service.register({
      username: randomUser,
      fullName: 'Test User',
      email: `${randomUser}@hope.com`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    })

    expect(result.status).toBe('pending')
    expect(result.role).toBe('user')
  })

  it('registers new user with linked empno', async () => {
    const randomUser = `empuser_${Date.now()}`
    const result = await service.register({
      username: randomUser,
      fullName: 'John Smith Linked',
      email: `${randomUser}@hope.com`,
      empno: '00001',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    })

    expect(result.empno).toBe('00001')
    expect(result.status).toBe('pending')
  })
})
