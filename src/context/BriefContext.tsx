import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import BriefWizard from '@/components/BriefWizard'
import { useLanguage } from '@/hooks/useLanguage'

interface BriefContextValue {
  open: (serviceId?: string) => void
  close: () => void
}

const BriefContext = createContext<BriefContextValue | null>(null)

export function BriefProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen]     = useState(false)
  const [serviceId, setServiceId] = useState<string | undefined>()
  const { lang }                = useLanguage()

  const open  = useCallback((id?: string) => { setServiceId(id); setIsOpen(true) }, [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <BriefContext.Provider value={{ open, close }}>
      {children}
      <BriefWizard open={isOpen} initialServiceId={serviceId} lang={lang} onClose={close} />
    </BriefContext.Provider>
  )
}

export function useBrief() {
  const ctx = useContext(BriefContext)
  if (!ctx) throw new Error('useBrief must be used inside <BriefProvider>')
  return ctx
}
