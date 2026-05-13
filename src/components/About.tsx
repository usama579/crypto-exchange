'use client';

import { Shield, Zap, Globe, Users, Award, Lock } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Shield,
      title: 'Secure Trading',
      description: 'Bank-level security with cold storage and multi-signature wallets to protect your assets.'
    },
    {
      icon: Zap,
      title: 'Fast Execution',
      description: 'Lightning-fast order execution with minimal latency for optimal trading experience.'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Trade cryptocurrencies 24/7 from anywhere in the world with our global platform.'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Professional customer support team available around the clock to assist you.'
    },
    {
      icon: Award,
      title: 'Low Fees',
      description: 'Competitive trading fees with volume discounts for high-frequency traders.'
    },
    {
      icon: Lock,
      title: 'Regulatory Compliance',
      description: 'Fully compliant with international regulations and financial standards.'
    }
  ];

  return (
    <div className="p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About CryptoExchange
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The world's leading cryptocurrency exchange platform, offering secure, fast,
          and reliable trading services to millions of users globally.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            To democratize access to cryptocurrency trading by providing a secure,
            user-friendly platform that empowers individuals and institutions to
            participate in the digital economy with confidence.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white rounded-lg p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">5M+</div>
            <div className="text-gray-300">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">$50B+</div>
            <div className="text-gray-300">Trading Volume</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">200+</div>
            <div className="text-gray-300">Cryptocurrencies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
            <div className="text-gray-300">Uptime</div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">John Smith</h3>
            <p className="text-gray-600 mb-2">CEO & Co-Founder</p>
            <p className="text-sm text-gray-600">
              Former Wall Street executive with 15 years of fintech experience.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Johnson</h3>
            <p className="text-gray-600 mb-2">CTO & Co-Founder</p>
            <p className="text-sm text-gray-600">
              Blockchain expert and former Google software engineer.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mike Chen</h3>
            <p className="text-gray-600 mb-2">Head of Security</p>
            <p className="text-sm text-gray-600">
              Cybersecurity specialist with expertise in cryptocurrency security.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
        <p className="text-gray-600 mb-6">
          Have questions? We'd love to hear from you.
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Email: support@cryptoexchange.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Crypto Street, Blockchain City, BC 12345</p>
        </div>
      </div>
    </div>
  );
}