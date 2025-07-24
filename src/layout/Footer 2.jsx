import React from 'react';
import { Twitter, Instagram, Youtube, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-purple-900/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <img
              src="/images/BankrollLogoTransparent.png"
              alt="Bankroll"
              className="h-8 w-auto"
            />
            <p className="text-sm text-purple-200">
              Your trusted platform for smart betting and bankroll management.
            </p>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Spend Card
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Bankroll Manager
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Analytics
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Mobile App
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Responsible Gaming
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-900/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <p className="text-sm text-purple-200 mb-4 md:mb-0">
              © {currentYear} Bankroll. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-purple-200 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-purple-200 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-purple-200 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-purple-200 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;