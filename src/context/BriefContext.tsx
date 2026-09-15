import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import BriefWizard from '@/components/BriefWizard'
import { useLanguage } from '@/hooks/useLanguage'

export const DEFAULT_BRIEF_SOURCE = 'brief-wizard'

interface BriefContextValue {
  /** source — точка входа визарда, уходит в CRM (например "brief-wizard-footer") */
  open: (serviceId?: string, source?: string) => void
  close: () => void
}

const BriefContext = createContext<BriefContextValue | null>(null)

export function BriefProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen]     = useState(false)
  const [serviceId, setServiceId] = useState<string | undefined>()
  const [source, setSource]     = useState(DEFAULT_BRIEF_SOURCE)
  const { lang }                = useLanguage()

  const open  = useCallback((id?: string, src?: string) => {
    setServiceId(id)
    setSource(src || DEFAULT_BRIEF_SOURCE)
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <BriefContext.Provider value={{ open, close }}>
      {children}
      <BriefWizard open={isOpen} initialServiceId={serviceId} source={source} lang={lang} onClose={close} />
    </BriefContext.Provider>
  )
}

export function useBrief() {
  const ctx = useContext(BriefContext)
  if (!ctx) throw new Error('useBrief must be used inside <BriefProvider>')
  return ctx
}
