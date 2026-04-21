import { useContext } from 'react'
import { StoreCtx, type StoreApi } from './context'

export function useStore(): StoreApi {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>')
  return ctx
}
