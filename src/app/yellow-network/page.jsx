"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import YellowIntegrationPanel from '@/components/YellowNetwork/IntegrationPanel';

export default function YellowNetworkPage() {
  return (
    <div className="min-h-screen bg-[#070005] bg-gradient-to-b from-[#070005] to-[#0e0512] pb-20 text-white">
      <div className="pt-24 px-4 md:px-8 lg:px-20">
        {/* Hero Section */}
        <motion.div 
          className="relative rounded-2xl overflow-hidden border border-yellow-800/30 bg-gradient-to-br from-yellow-900/10 to-yellow-800/5 p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-600/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-600/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/3">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-full">
                  <span className="text-black font-bold text-xl">Y</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  Yellow Network Integration
                </h1>
              </div>
              
              <p className="text-lg text-yellow-100/80 mb-6">
                APT Casino now leverages Yellow Network's state channel technology to provide gasless, high-performance gaming experiences. Enjoy instant interactions, zero gas fees, and provably fair gaming.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/game/mines"
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 transition-colors rounded-lg text-black font-medium flex items-center gap-2"
                >
                  <span>Try Mines Game</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                <a 
                  href="https://docs.yellow.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-black/30 hover:bg-black/50 border border-yellow-800/30 transition-colors rounded-lg text-yellow-100 font-medium"
                >
                  Learn More
                </a>
              </div>
            </div>
            
            <div className="md:w-1/3 flex justify-center">
              <div className="w-40 h-40 md:w-56 md:h-56 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-6xl md:text-8xl shadow-lg shadow-yellow-600/20 border-8 border-yellow-600/50">
                Y
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Features Section */}
        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-yellow-900/10 to-yellow-800/5 border border-yellow-800/30 rounded-xl p-6">
            <div className="w-12 h-12 bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-yellow-300 mb-2">Gasless Gaming</h3>
            <p className="text-yellow-100/70">
              Play casino games without paying gas fees for each interaction. All game actions happen off-chain through Yellow Network state channels.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/10 to-yellow-800/5 border border-yellow-800/30 rounded-xl p-6">
            <div className="w-12 h-12 bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-yellow-300 mb-2">Instant Interactions</h3>
            <p className="text-yellow-100/70">
              Experience near-instant responses for a smooth gaming experience. No more waiting for blockchain confirmations.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/10 to-yellow-800/5 border border-yellow-800/30 rounded-xl p-6">
            <div className="w-12 h-12 bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-yellow-300 mb-2">Provably Fair</h3>
            <p className="text-yellow-100/70">
              All random number generation is verifiable and transparent through Yellow Network's state channel VRF system.
            </p>
          </div>
        </motion.div>
        
        {/* Integration Panel */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Try Yellow Network Integration</h2>
          <YellowIntegrationPanel gameType="MINES" />
        </motion.div>
        
        {/* How It Works */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
          
          <div className="bg-gradient-to-br from-yellow-900/10 to-yellow-800/5 border border-yellow-800/30 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-400 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-300 mb-1">Channel Creation</h3>
                      <p className="text-yellow-100/70">
                        Players create a Yellow Network channel through the UI or on apps.yellow.com
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-400 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-300 mb-1">Game Session</h3>
                      <p className="text-yellow-100/70">
                        When a player starts a game, a dedicated game session is created using Yellow Network state channels
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-400 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-300 mb-1">Off-Chain Interactions</h3>
                      <p className="text-yellow-100/70">
                        All game interactions happen off-chain through the state channels
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-400 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-300 mb-1">Settlement</h3>
                      <p className="text-yellow-100/70">
                        When a player cashes out, the final state is settled on-chain
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div className="md:w-1/2">
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-md bg-black/30 rounded-lg p-4 border border-yellow-800/20">
                    <pre className="text-xs text-yellow-100/80 overflow-auto">
                      <code>{`// Example of state channel session creation
async createGameSession(gameType) {
  // Create application session for the game
  const session = await this.client.createSession({
    appId: \`apt-casino-\${gameType.toLowerCase()}\`,
    params: {
      gameType,
      timestamp: Date.now(),
    },
  });
  
  this.sessionId = session.id;
  this.gameType = gameType;
  
  return session;
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Call to Action */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Experience Gasless Gaming?</h2>
          <p className="text-yellow-100/70 max-w-2xl mx-auto mb-6">
            Try our Mines game powered by Yellow Network state channels for a seamless, high-performance gaming experience.
          </p>
          
          <Link 
            href="/game/mines"
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 transition-colors rounded-lg text-black font-medium inline-flex items-center gap-2"
          >
            <span>Play Mines Game</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
