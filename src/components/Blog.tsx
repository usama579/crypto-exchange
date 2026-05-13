'use client';

import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  featured?: boolean;
}

export default function Blog() {
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Understanding DeFi: The Future of Financial Services",
      excerpt: "Explore how decentralized finance is revolutionizing traditional banking and financial services through blockchain technology.",
      author: "Sarah Johnson",
      date: "April 25, 2026",
      category: "DeFi",
      readTime: "5 min read",
      featured: true
    },
    {
      id: 2,
      title: "Bitcoin Halving 2024: What Investors Need to Know",
      excerpt: "A comprehensive guide to Bitcoin's upcoming halving event and its potential impact on cryptocurrency markets.",
      author: "Mike Chen",
      date: "April 22, 2026",
      category: "Bitcoin",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Security Best Practices for Crypto Trading",
      excerpt: "Essential security measures every cryptocurrency trader should implement to protect their digital assets.",
      author: "Alex Thompson",
      date: "April 20, 2026",
      category: "Security",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Altcoin Season: Identifying Promising Projects",
      excerpt: "Learn how to research and evaluate alternative cryptocurrencies for potential investment opportunities.",
      author: "Emily Davis",
      date: "April 18, 2026",
      category: "Analysis",
      readTime: "8 min read"
    },
    {
      id: 5,
      title: "NFTs and Gaming: The New Digital Economy",
      excerpt: "Exploring the intersection of non-fungible tokens and gaming, and what it means for the future of digital ownership.",
      author: "John Smith",
      date: "April 15, 2026",
      category: "NFTs",
      readTime: "4 min read"
    },
    {
      id: 6,
      title: "Regulatory Updates: Global Crypto Landscape 2026",
      excerpt: "Stay informed about the latest regulatory developments affecting cryptocurrency markets worldwide.",
      author: "Lisa Rodriguez",
      date: "April 12, 2026",
      category: "Regulation",
      readTime: "6 min read"
    }
  ];

  const categories = ["All", "DeFi", "Bitcoin", "Security", "Analysis", "NFTs", "Regulation"];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Crypto Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Stay updated with the latest insights, analysis, and trends in the cryptocurrency world.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Featured Post */}
      {blogPosts.find(post => post.featured) && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {blogPosts[0].category}
                </span>
                <span className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  {blogPosts[0].date}
                </span>
                <span className="flex items-center">
                  <User size={16} className="mr-1" />
                  {blogPosts[0].author}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {blogPosts[0].title}
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                {blogPosts[0].excerpt}
              </p>
              <button className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Read More
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.slice(1).map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100"></div>
            <div className="p-6">
              <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                  {post.category}
                </span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <User size={14} className="mr-1" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  <span>{post.date}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-medium transition-colors">
                Read Article
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-900 text-white rounded-lg p-8 mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter to receive the latest crypto insights,
          market analysis, and trading tips directly in your inbox.
        </p>
        <div className="max-w-md mx-auto flex gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}