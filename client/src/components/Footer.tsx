
import React from "react";
import { Link, useLocation } from "wouter";
import { FaTelegram, FaTwitter, FaInstagram, FaDiscord } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const [location] = useLocation();

  return (
    <footer className="bg-black/95 border-t border-gray-800 py-12 px-4 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 - Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold">9A</span>
              </div>
              <h2 className="text-xl font-bold">9Anime</h2>
            </div>
            <p className="text-muted-foreground text-sm text-center md:text-left mb-4">
              Your ultimate destination for anime streaming. Watch your
              favorite anime shows and movies in HD quality.
            </p>
            <p className="text-xs text-muted-foreground/80 text-center md:text-left">
              © {new Date().getFullYear()} 9Anime. All rights reserved.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/recently-watched" className="text-muted-foreground hover:text-primary transition-colors">
                  Recently Watched
                </Link>
              </li>
              <li>
                <Link href="/category/action" className="text-muted-foreground hover:text-primary transition-colors">
                  Action Anime
                </Link>
              </li>
              <li>
                <Link href="/category/popular" className="text-muted-foreground hover:text-primary transition-colors">
                  Popular Anime
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Social Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 text-primary">Connect With Us</h3>
            <div className="flex items-center gap-4">
              <motion.a 
                href="https://x.com/9AnimeOfficial?t=g-WLtTKMcFKNou4Gfhx6tg&s=09" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-primary p-3 rounded-full text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-110"
                whileHover={{ y: -3 }}
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a 
                href="https://t.me/nineanimeofchat" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-primary p-3 rounded-full text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-110"
                whileHover={{ y: -3 }}
              >
                <FaTelegram size={20} />
              </motion.a>
              <motion.a 
                href="https://www.instagram.com/9anime_official?igsh=dGh4eDh6dWs3bGM4" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-primary p-3 rounded-full text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-110"
                whileHover={{ y: -3 }}
              >
                <FaInstagram size={20} />
              </motion.a>
              <motion.a 
                href="https://discord.gg/q9D44eGeES" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-primary p-3 rounded-full text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-110"
                whileHover={{ y: -3 }}
              >
                <FaDiscord size={20} />
              </motion.a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />
        
        <div className="flex flex-col items-center mb-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-primary/10 hover:bg-primary/20 transition-all duration-300 px-6 py-3 sm:px-6 sm:py-3 rounded-full flex items-center hover:shadow-lg transform hover:scale-105 group mb-6 active:scale-95"
            aria-label="Scroll to top of page"
            style={{ touchAction: 'manipulation' }} // Improves touch response
          >
            <i className="fas fa-arrow-up mr-2 group-hover:animate-bounce"></i>
            <span className="font-medium">Back to Top</span>
          </button>
        </div>
        
        {/* Fixed mobile back-to-top button */}
        <div className="md:hidden fixed bottom-20 right-4 z-50">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-primary text-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center transform hover:scale-110 transition-all active:scale-95 back-to-top-btn"
            aria-label="Scroll to top of page"
            style={{ touchAction: 'manipulation' }} // Improves touch response
          >
            <i className="fas fa-arrow-up animate-bounce"></i>
          </button>
        </div>
        
        <div className="text-xs text-center text-muted-foreground/60">
          <p>
            All videos on this site are hosted by third parties. We are not responsible for their content.
          </p>
          <p className="mt-1">
            DMCA: If you believe that your copyrighted content is being infringed, please contact us.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
