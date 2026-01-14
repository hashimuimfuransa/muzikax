'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Home', href: '/' },
      { name: 'Explore', href: '/explore' },
      { name: 'Artists', href: '/artists' },
      { name: 'Playlists', href: '/playlists' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Press', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '/faq' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Community', href: '#' },
      { name: 'Status', href: '#' },
    ],
    legal: [
      { name: 'Terms of Use', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Copyright Policy', href: '/copyright' },
      { name: 'Cookie Policy', href: '#' },
    ],
    social: [
      { name: 'Twitter', href: '#', icon: '🐦' },
      { name: 'Instagram', href: '#', icon: '📸' },
      { name: 'Facebook', href: '#', icon: '👍' },
      { name: 'YouTube', href: '#', icon: '📺' },
    ]
  }

  return (
    <footer className="bg-gray-900 border-t border-gray-800 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center">
              <img src="/muzikax.png" alt="MuzikaX Logo" className="h-8 w-auto" />
              <span className="ml-3 text-xl font-bold text-white">MuzikaX</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              Connecting Rwandan music creators with fans worldwide. Discover, stream, and share the best of Rwandan music.
            </p>
            <div className="flex space-x-4 mt-6">
              {footerLinks.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-[#FF4D67] transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} MuzikaX. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-gray-400 text-sm text-center">Made with ❤️ in Rwanda</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}