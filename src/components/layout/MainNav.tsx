import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MenuToggleIcon } from '@/components/ui/MenuToggleIcon'
import { LogoIcon } from '@/components/ui/LogoIcon'

const TELEGRAM_URL = 'https://t.me/neeekn'

const NAV_LINKS = [
  { label: 'Услуги',   href: '/services' },
  { label: 'Работы',   href: '/cases' },
  { label: 'Блог',     href: '/blog' },
  { label: 'Контакты', href: '/contact' },
]

export function MainNav() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  const onScroll = useCallback(() => setScrolled(window.scrollY > 10), [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ─── Scroll-aware header style ────────────────────────────────────────────────
  // Using project CSS variables (var(--bg), var(--bd)) so the style is correct
  // in both light and dark themes without relying on Tailwind token resolution.
  const headerStyle: React.CSSProperties =
    scrolled && !open
      ? {
          background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--bd)',
          boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
        }
      : open
      ? { background: 'var(--bg)' }
      : {}

  return (
    <>
      {/*
        KEY: the <header> must be w-full (not mx-auto max-w-6xl) for `sticky` to
        work reliably in all browsers.  The max-width constraint lives on the
        inner <nav> instead, following the standard sticky-header pattern.
      */}
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300 ease-out"
        style={headerStyle}
      >
        <nav className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" style={{ color: 'var(--tx)' }}>
            <LogoIcon height={28} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors duration-150',
                    isActive
                      ? 'font-medium'
                      : 'hover:opacity-80',
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--tx)' : 'var(--tx-muted)',
                  background: isActive ? 'var(--surface-2)' : 'transparent',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-85"
              style={{ background: 'var(--tx)', color: 'var(--bg)' }}
            >
              <Send size={13} />
              Хочу демо
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--tx-muted)' }}
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </button>

        </nav>
      </header>

      {/* Mobile menu — fixed overlay below header */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-[49] md:hidden flex flex-col"
          style={{
            top: 56, // header height
            background: 'var(--bg)',
            borderTop: '1px solid var(--bd)',
          }}
        >
          {/* Nav links */}
          <nav className="flex flex-col gap-1 p-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="py-3 px-4 rounded-xl text-base transition-colors"
                style={{ color: 'var(--tx-muted)', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--tx)'; (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--tx-muted)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA at bottom */}
          <div className="mt-auto p-4 pb-safe">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl text-base font-semibold text-center inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: 'var(--tx)', color: 'var(--bg)', textDecoration: 'none' }}
            >
              <Send size={16} />
              Хочу демо
            </a>
          </div>
        </div>
      )}
    </>
  )
}

export default MainNav
