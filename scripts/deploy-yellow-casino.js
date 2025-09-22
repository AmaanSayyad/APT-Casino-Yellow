const { ethers } = require("hardhat");

async function main() {
  console.log("🟡 YELLOW CASINO: Starting deployment...");
  console.log("🔗 Network: Arbitrum Sepolia");
  console.log("🎮 Contract: YellowCasino (VRF-free)");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Treasury address (can be the deployer or a different address)
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  console.log("🏦 Treasury address:", treasuryAddress);
  
  // Deploy YellowCasino contract
  console.log("\n🚀 Deploying YellowCasino contract...");
  
  const YellowCasino = await ethers.getContractFactory("YellowCasino");
  const yellowCasino = await YellowCasino.deploy(treasuryAddress);
  
  await yellowCasino.waitForDeployment();
  
  console.log("✅ YellowCasino deployed to:", await yellowCasino.getAddress());
  console.log("🏦 Treasury set to:", treasuryAddress);
  
  // Get deployment transaction
  const deployTx = yellowCasino.deploymentTransaction();
  console.log("📋 Deployment transaction:", deployTx.hash);
  
  // Wait for a few confirmations
  console.log("⏳ Waiting for confirmations...");
  await deployTx.wait(3);
  
  // Get contract details
  const contractAddress = await yellowCasino.getAddress();
  const contractBalance = await ethers.provider.getBalance(contractAddress);
  const houseEdge = await yellowCasino.houseEdge();
  const minBet = await yellowCasino.minBet();
  const maxBet = await yellowCasino.maxBet();
  
  console.log("\n📊 Contract Details:");
  console.log("🏠 Contract Address:", contractAddress);
  console.log("💰 Contract Balance:", ethers.formatEther(contractBalance), "ETH");
  console.log("🎯 House Edge:", houseEdge.toString(), "basis points (", (Number(houseEdge) / 100).toString(), "%)");
  console.log("📉 Min Bet:", ethers.formatEther(minBet), "ETH");
  console.log("📈 Max Bet:", ethers.formatEther(maxBet), "ETH");
  
  // Fund the contract with some initial ETH for payouts
  const fundAmount = ethers.parseEther("1.0"); // 1 ETH
  if (balance > (fundAmount * 2n)) { // Only fund if deployer has enough
    console.log("\n💳 Funding contract with initial liquidity...");
    const fundTx = await deployer.sendTransaction({
      to: contractAddress,
      value: fundAmount
    });
    await fundTx.wait();
    
    const newBalance = await ethers.provider.getBalance(contractAddress);
    console.log("✅ Contract funded with:", ethers.formatEther(fundAmount), "ETH");
    console.log("💰 New contract balance:", ethers.formatEther(newBalance), "ETH");
  }
  
  // Verify contract on Arbiscan (if API key is provided)
  if (process.env.ARBISCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on Arbiscan...");
    try {
      await hre.run("verify:verify", {
        address: yellowCasino.address,
        constructorArguments: [treasuryAddress],
      });
      console.log("✅ Contract verified on Arbiscan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "arbitrum-sepolia",
    contractName: "YellowCasino",
    contractAddress: contractAddress,
    treasuryAddress: treasuryAddress,
    deployerAddress: deployer.address,
    transactionHash: deployTx.hash,
    blockNumber: deployTx.blockNumber,
    gasUsed: deployTx.gasLimit?.toString(),
    timestamp: new Date().toISOString(),
    houseEdge: houseEdge.toString(),
    minBet: minBet.toString(),
    maxBet: maxBet.toString()
  };
  
  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, 'yellow-casino-arbitrum-sepolia.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📄 Deployment info saved to:", deploymentFile);
  
  console.log("\n🎉 YELLOW CASINO DEPLOYMENT COMPLETE!");
  console.log("🔗 Contract Address:", contractAddress);
  console.log("🌐 Network: Arbitrum Sepolia");
  console.log("🟡 Ready for Yellow Network integration!");
  
  // Instructions for next steps
  console.log("\n📋 Next Steps:");
  console.log("1. Update .env.local with contract address:");
  console.log(`   NEXT_PUBLIC_YELLOW_CASINO_ADDRESS=${contractAddress}`);
  console.log("2. Configure Yellow Network state channels");
  console.log("3. Test with small amounts first");
  console.log("4. Monitor contract balance and refill as needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });