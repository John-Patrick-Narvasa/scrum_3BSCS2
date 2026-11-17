import { AuthService } from '@/lib/services/auth.service'

describe('Access Control Security Checks', () => {
  it('prevents pending users from executing guarded rights', async () => {
    const service = new AuthService()
    // Test that requireRight fails when session status is pending
    await expect(service.requireRight('CUST_ADD')).rejects.toThrow()
  })

  it('prevents unauthorized users from calling requireRole', async () => {
    const service = new AuthService()
    await expect(service.requireRole(['admin', 'superadmin'])).rejects.toThrow()
  })
})
