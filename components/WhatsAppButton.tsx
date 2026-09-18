'use client'

// Update WHATSAPP_NUMBER with the real number (country code + digits, no spaces or dashes)
const WHATSAPP_NUMBER = '522224278565'

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        width: '58px',
        height: '58px',
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 24px rgba(37, 211, 102, 0.45)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 32px rgba(37, 211, 102, 0.65)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(37, 211, 102, 0.45)'
      }}
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="#ffffff"
        aria-hidden="true"
      >
        <path d="M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.354.63 4.655 1.828 6.672L2.667 29.333l6.848-1.795A13.263 13.263 0 0 0 16.003 29.333C23.37 29.333 29.333 23.364 29.333 16c0-7.364-5.963-13.333-13.33-13.333zm0 24.258a11.027 11.027 0 0 1-5.617-1.537l-.404-.238-4.063 1.065 1.083-3.96-.264-.42A10.95 10.95 0 0 1 5.003 16c0-6.075 4.925-11 11-11s11 4.925 11 11-4.925 11-11 11zm6.02-8.234c-.33-.165-1.951-.963-2.254-1.073-.302-.11-.522-.165-.741.165-.22.33-.852 1.073-1.044 1.293-.192.22-.384.248-.714.083-.33-.165-1.392-.513-2.651-1.636-.98-.874-1.641-1.952-1.833-2.282-.192-.33-.021-.508.144-.672.149-.148.33-.385.496-.577.165-.192.22-.33.33-.55.11-.22.055-.412-.027-.577-.083-.165-.741-1.786-1.015-2.446-.267-.642-.539-.555-.741-.565l-.632-.011c-.22 0-.577.082-.879.412-.302.33-1.154 1.128-1.154 2.75s1.182 3.19 1.347 3.41c.165.22 2.327 3.554 5.64 4.984.788.34 1.403.543 1.882.695.79.251 1.51.216 2.079.131.634-.094 1.951-.798 2.226-1.568.275-.77.275-1.43.192-1.568-.082-.138-.302-.22-.632-.385z"/>
      </svg>
    </a>
  )
}
