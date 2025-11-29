import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying PayPerInsight to Monad Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "MON\n");

  // Deploy contract
  const PayPerInsight = await ethers.getContractFactory("PayPerInsight");
  const contract = await PayPerInsight.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ PayPerInsight deployed to:", address);
  console.log("\n📋 Contract Details:");
  console.log("   - Name: PayPerInsight");
  console.log("   - Symbol: PPI");
  console.log("   - Owner:", deployer.address);
  
  console.log("\n🔗 Add to your .env file:");
  console.log(`   CONTRACT_ADDRESS=${address}`);
  
  console.log("\n📝 Next steps:");
  console.log("   1. Copy the contract address above");
  console.log("   2. Add it to your .env file");
  console.log("   3. Start the backend and frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

