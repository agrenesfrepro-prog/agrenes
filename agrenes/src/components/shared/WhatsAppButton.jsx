export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/256700000000?text=Hello%20AGRENES%2C%20I%20would%20like%20to%20enquire%20about%20your%20fresh%20produce."
      target="_blank"
      rel="noopener noreferrer"
      title="Chat with AGRENES on WhatsApp"
      style={{
        position: 'fixed', bottom: 80, right: 16, zIndex: 600,
        width: 52, height: 52, borderRadius: '50%',
        background: '#25D366', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(37,211,102,.4)',
        fontSize: 26, textDecoration: 'none',
        transition: 'transform .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      💬
    </a>
  )
}
