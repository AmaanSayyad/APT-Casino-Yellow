# APT Casino - Yellow Network Hackathon 2025

This project is an entry for the Yellow Network Hackathon 2025, showcasing the integration of Yellow Network's state channel technology into the APT Casino platform.

## 🎮 Demo

[Demo Video Link - To Be Added]

## 🚀 Project Overview

APT Casino is a blockchain-based casino platform that has been enhanced with Yellow Network's state channel technology to provide gasless, high-performance gaming experiences. This integration leverages the Nitrolite SDK and ERC-7824 state channels to move game interactions off-chain while maintaining the security and verifiability of blockchain technology.

### Key Features

- **Gasless Gaming**: Players can enjoy casino games without paying gas fees for each interaction
- **Low Latency**: State channels provide near-instant responses for a smooth gaming experience
- **Provable Fairness**: All random number generation is verifiable and transparent through Yellow Network state channels
- **Cross-Chain Compatibility**: The solution works across different blockchains

## 🔧 Technical Implementation

### Yellow Network Integration

The integration includes several key components:

1. **Channel Management**: Create and manage Yellow Network channels
2. **Game Sessions**: Create dedicated sessions for each game type
3. **Verifiable Random Function (VRF)**: Generate provably fair random numbers using Yellow Network state channels
4. **UI Components**: Seamlessly integrate Yellow Network functionality into the casino UI

### Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **State Channels**: Yellow Network Nitrolite SDK (ERC-7824)
- **Smart Contracts**: Solidity (for on-chain settlement)
- **State Management**: React hooks, Context API

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  APT Casino UI                      │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│             Yellow Network Integration              │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌───────────┐  │
│  │   Channel   │   │    Game     │   │    VRF    │  │
│  │  Management │   │   Sessions  │   │  Service  │  │
│  └─────────────┘   └─────────────┘   └───────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│               Nitrolite SDK (ERC-7824)              │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│                   ClearNode                         │
└─────────────────────────────────────────────────────┘
```

## 📋 How It Works

1. **Channel Creation**: Players create a Yellow Network channel through the UI or on apps.yellow.com
2. **Game Session**: When a player starts a game, a dedicated game session is created using the Yellow Network state channels
3. **Off-Chain Interactions**: All game interactions (bets, reveals, etc.) happen off-chain through the state channels
4. **Provably Fair Randomness**: Random numbers for game outcomes are generated using Yellow Network's VRF system
5. **Settlement**: When a player cashes out, the final state is settled on-chain

## 🎲 Games Implemented

- **Mines**: A minesweeper-like game where players uncover gems while avoiding mines
- **Roulette**: Traditional casino roulette game (in progress)
- **Plinko**: A ball-drop game with varying payout multipliers (in progress)
- **Wheel**: A spinning wheel game with different multiplier segments (in progress)

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/APT-Casino-Yellow.git
   cd APT-Casino-Yellow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_YELLOW_NETWORK_URL=wss://clearnet.yellow.com/ws
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📚 Documentation

For detailed technical documentation, please refer to the following:

- [Yellow Network Integration](./docs/yellow-network-integration.md)
- [Yellow Network Documentation](https://docs.yellow.org/)
- [ERC-7824 Documentation](https://erc7824.org/)

## 🔮 Future Enhancements

1. **Multi-Game Support**: Extend the Yellow Network integration to all casino games
2. **Player-to-Player Interactions**: Enable direct player interactions using state channels
3. **Tournament System**: Create a tournament system using Yellow Network for real-time updates
4. **Enhanced Analytics**: Implement detailed analytics for game performance and player behavior

## 👥 Team

- [Your Name] - Lead Developer
- [Team Member 2] - Frontend Developer
- [Team Member 3] - Smart Contract Developer

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Yellow Network for providing the state channel technology
- Chainlink for the original VRF implementation that was migrated
- The Yellow Network Hackathon 2025 organizers and mentors
