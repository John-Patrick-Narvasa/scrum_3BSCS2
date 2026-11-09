import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  setPasswordSchema,
} from '@/lib/validations/auth.schema'

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid username and password', () => {
      const result = loginSchema.safeParse({
        emailOrUsername: 'superadmin',
        password: 'Password123!',
      })
      expect(result.success).toBe(true)
    })

    it('rejects short password (< 6 chars)', () => {
      const result = loginSchema.safeParse({
        emailOrUsername: 'superadmin',
        password: '123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('accepts valid registration input', () => {
      const result = registerSchema.safeParse({
        username: 'jdelacruz',
        fullName: 'Juan dela Cruz',
        email: 'juan@hope.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      expect(result.success).toBe(true)
    })

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({
        username: 'jdelacruz',
        fullName: 'Juan dela Cruz',
        email: 'juan@hope.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match')
      }
    })

    it('rejects passwords without uppercase letters or numbers', () => {
      const result = registerSchema.safeParse({
        username: 'jdelacruz',
        fullName: 'Juan dela Cruz',
        email: 'juan@hope.com',
        password: 'alllowercasepassword',
        confirmPassword: 'alllowercasepassword',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('validates token and matching new passwords', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'rst-validtoken123',
        password: 'NewPassword99!',
        confirmPassword: 'NewPassword99!',
      })
      expect(result.success).toBe(true)
    })
  })
})
