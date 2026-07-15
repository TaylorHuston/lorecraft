export const accountOwnedQueryKey = ['account-owned'] as const

export function accountOwnedQueryKeyFor(accountId: number) {
  return [...accountOwnedQueryKey, accountId] as const
}
