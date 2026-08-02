import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-12 border-t border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-xl text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ElevateX
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              ElevateX is the premier unified EdTech + Career ecosystem. Learn high-demand competencies, earn cryptographic credentials, and secure elite corporate placements effortlessly.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Core Paths */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Trending Tech Paths</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses?category=AI" className="hover:text-white transition-colors">AI & Machine Learning</Link>
              </li>
              <li>
                <Link to="/courses?category=Web" className="hover:text-white transition-colors">Full-Stack Web Development</Link>
              </li>
              <li>
                <Link to="/courses?category=UIUX" className="hover:text-white transition-colors">UI/UX Interface Design</Link>
              </li>
              <li>
                <Link to="/courses?category=Cloud" className="hover:text-white transition-colors">Cloud Systems & DevOps</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Resources */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Ecosystem</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Course Catalogue</Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">Global Job Board</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">Membership Pricing</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">Frequent Questions</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3.5 text-sm">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact HQ</h3>
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>One Infinite Loop, Cupertino, CA 95014</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <span>support@elevatex.com</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <span>+1 (800) ELEVATE-X</span>
            </div>
          </div>
        </div>

        {/* Footnote bar */}
        <div className="pt-8 border-t border-gray-800 text-center md:flex md:justify-between md:items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ElevateX Corporation. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4 md:mt-0">
            <a href="#privacy" className="hover:text-gray-300 transition-colors">Privacy Charter</a>
            <a href="#terms" className="hover:text-gray-300 transition-colors">Terms of Engagement</a>
            <a href="#cookies" className="hover:text-gray-300 transition-colors">Cookie Configurations</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
