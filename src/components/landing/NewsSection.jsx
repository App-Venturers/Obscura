import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { CalendarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const NewsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const news = [
    {
      id: 1,
      title: "Obscura Valorant Dominates VCT Masters",
      excerpt: "Our Valorant roster secured a commanding victory at VCT Masters, defeating the defending champions in a thrilling 5-map series.",
      date: "2024-03-15",
      category: "Tournament",
      image: "https://via.placeholder.com/600x400/7c3aed/ffffff?text=VCT+Victory",
      featured: true,
    },
    {
      id: 2,
      title: "New Signing: Welcome 'Blaze' to CS2 Roster",
      excerpt: "We're excited to announce the signing of star AWPer 'Blaze' to strengthen our CS2 lineup for the upcoming season.",
      date: "2024-03-10",
      category: "Roster Update",
      image: "https://via.placeholder.com/600x400/ec4899/ffffff?text=New+Signing",
    },
    {
      id: 3,
      title: "Obscura Partners with Gaming Peripheral Giant",
      excerpt: "Strategic partnership announced with leading gaming hardware manufacturer to provide cutting-edge equipment for all teams.",
      date: "2024-03-05",
      category: "Partnership",
      image: "https://via.placeholder.com/600x400/3b82f6/ffffff?text=Partnership",
    },
    {
      id: 4,
      title: "League Team Qualifies for Worlds 2024",
      excerpt: "After an incredible split, our League of Legends team has secured their spot at the World Championship.",
      date: "2024-02-28",
      category: "Achievement",
      image: "https://via.placeholder.com/600x400/10b981/ffffff?text=Worlds+2024",
    },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Tournament':
        return 'from-purple-600 to-pink-600';
      case 'Roster Update':
        return 'from-blue-600 to-cyan-600';
      case 'Partnership':
        return 'from-green-600 to-emerald-600';
      case 'Achievement':
        return 'from-yellow-600 to-orange-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <section id="news" className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-4">
            Latest News
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Stay updated with the latest victories, roster changes, and organization updates
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Article */}
          {news.filter(article => article.featured).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="group relative h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(article.category)} text-white text-xs font-bold rounded-full`}>
                      {article.category}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-500/80 backdrop-blur text-black text-xs font-bold rounded-full">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(article.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Read More
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Other Articles */}
          <div className="space-y-6">
            {news.filter(article => !article.featured).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="group flex gap-4 bg-black/50 border border-gray-800 rounded-xl p-4 hover:border-purple-700/50 hover:bg-purple-900/10 transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 bg-gradient-to-r ${getCategoryColor(article.category)} text-white text-xs font-bold rounded-full`}>
                        {article.category}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(article.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-gray-400 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center">
                    <ArrowRightIcon className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="px-8 py-3 border-2 border-purple-500 text-purple-400 font-bold rounded-lg hover:bg-purple-500/10 transition-all duration-300">
            View All News
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;