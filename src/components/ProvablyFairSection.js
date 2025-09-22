'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ProvablyFairSection = () => {
  const [activeTab, setActiveTab] = useState(1);
  
  const steps = [
    {
      id: 1,
      title: 'Chainlink VRF Request',
      description: 'When you start a game, our smart contract requests verifiable randomness from Chainlink VRF on Arbitrum. This process is fully on-chain and transparent.',
      icon: 'client-seed',
      code: 'requestId = vrfCoordinator.requestRandomWords(\n  keyHash,\n  subscriptionId,\n  requestConfirmations,\n  callbackGasLimit,\n  numWords\n);'
    },
    {
      id: 2,
      title: 'Randomness Generation',
      description: 'Chainlink VRF generates cryptographically secure random numbers and delivers them to our smart contract within 1.5 seconds (6 Arbitrum blocks).',
      icon: 'server-seed',
      code: '// Chainlink VRF generates random values\n// and delivers them on-chain\nrandomWords = generateVerifiableRandomValue();\n// 6 Arbitrum blocks ≈ 1.5 seconds'
    },
    {
      id: 3,
      title: 'On-Chain Verification',
      description: 'The randomness is verified on-chain through cryptographic proofs, ensuring that neither players nor casino operators can manipulate the outcome.',
      icon: 'calculation',
      code: 'function fulfillRandomWords(\n  uint256 requestId,\n  uint256[] memory randomWords\n) internal override {\n  // Store verified random values\n  requests[requestId].randomWords = randomWords;\n  requests[requestId].fulfilled = true;\n}'
    },
    {
      id: 4,
      title: 'Transparent Results',
      description: 'Game results are determined by the verified random numbers and can be independently verified by anyone through the Arbitrum blockchain explorer.',
      icon: 'verification',
      code: '// After game completes\nconst requestId = game.vrfRequestId;\nconst randomResult = vrfContract.getRandomWords(requestId);\nconst verified = verifyOnChain(randomResult);\nconsole.log("Verified on-chain:", verified);'
    },
  ];
  
  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 relative">
      {/* Background accents */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-red-magic/5 blur-[100px] z-0"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-magic/5 blur-[100px] z-0"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center mb-8">
          <div className="w-1 h-6 bg-gradient-to-r from-red-magic to-blue-magic rounded-full mr-3"></div>
          <h2 className="text-2xl font-display font-bold text-white">Chainlink VRF Powered Fairness</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left explanation column */}
          <div className="lg:col-span-5">
            <div className="p-[1px] bg-gradient-to-r from-red-magic to-blue-magic rounded-xl h-full">
              <div className="bg-[#1A0015] rounded-xl p-6 h-full">
                <h3 className="text-white text-xl font-medium mb-4">What is Chainlink VRF?</h3>
                <p className="text-white/80 mb-6">
                  Chainlink VRF (Verifiable Random Function) is a provably fair and verifiable source of randomness designed for 
                  smart contracts. Unlike traditional RNG systems, Chainlink VRF is cryptographically secure and fully verifiable 
                  on-chain, ensuring that neither APT-Casino nor any other party can manipulate game outcomes.
                </p>
                
                <div className="bg-[#250020] p-4 rounded-lg mb-6 border-l-2 border-red-magic">
                  <h4 className="text-white font-medium mb-2">Why Chainlink VRF matters</h4>
                  <ul className="text-white/70 text-sm space-y-2 list-disc pl-4">
                    <li>Cryptographically guaranteed randomness</li>
                    <li>Fully verifiable on the Arbitrum blockchain</li>
                    <li>Lightning-fast results (1.5 seconds)</li>
                    <li>Immune to manipulation by players, casino, or validators</li>
                    <li>Transparent process from request to result</li>
                  </ul>
                </div>
                
                <Link href="/provably-fair">
                  <div className="inline-block">
                    <div className="p-[1px] bg-gradient-to-r from-red-magic to-blue-magic rounded-md inline-block">
                      <button className="bg-[#1A0015] hover:bg-[#250020] transition-colors text-white px-6 py-2 rounded-md flex items-center">
                        Verify On-Chain
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right steps column */}
          <div className="lg:col-span-7">
            <div className="p-[1px] bg-gradient-to-r from-red-magic/40 to-blue-magic/40 rounded-xl">
              <div className="bg-[#1A0015] rounded-xl p-6">
                <h3 className="text-white text-xl font-medium mb-4">How Chainlink VRF Works</h3>
                
                {/* Steps tabs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      className={`p-2 rounded-md text-sm font-medium transition-all text-center ${
                        activeTab === step.id
                          ? 'bg-gradient-to-r from-red-magic/80 to-blue-magic/80 text-white'
                          : 'bg-[#250020] text-white/70 hover:text-white'
                      }`}
                      onClick={() => setActiveTab(step.id)}
                    >
                      Step {step.id}
                    </button>
                  ))}
                </div>
                
                {/* Active tab content */}
                <div className="min-h-[250px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-4">
                      {/* Step icon placeholder - would be actual icons in production */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-magic/60 to-blue-magic/60 flex items-center justify-center mr-4">
                        <span className="text-white font-bold">{activeTab}</span>
                      </div>
                      <h4 className="text-white text-lg font-medium">{steps[activeTab-1].title}</h4>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed mb-8">
                      {steps[activeTab-1].description}
                    </p>
                  </div>
                  
                  {/* Code example showing Chainlink VRF implementation */}
                  <div className="bg-[#0D0D0D] rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono">
                      {steps[activeTab-1].code}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProvablyFairSection; 