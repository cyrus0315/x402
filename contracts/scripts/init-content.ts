import { ethers } from "hardhat";

async function main() {
  console.log("📝 Initializing test content on chain...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Using account:", deployer.address);

  // 获取已部署的合约
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const PayPerInsight = await ethers.getContractFactory("PayPerInsight");
  const contract = PayPerInsight.attach(contractAddress);

  console.log("📄 Contract:", contractAddress);
  console.log("");

  // 创建测试内容
  const testContents = [
    {
      price: ethers.parseEther("0.01"), // 0.01 ETH
      metadataURI: "ipfs://QmTrading123",
      title: "Monad 高性能交易策略",
    },
    {
      price: ethers.parseEther("0.005"), // 0.005 ETH
      metadataURI: "ipfs://QmPrompt456",
      title: "GPT-4 终极 Prompt 工程指南",
    },
    {
      price: ethers.parseEther("0.02"), // 0.02 ETH
      metadataURI: "ipfs://QmSecurity789",
      title: "Web3 智能合约安全审计清单",
    },
  ];

  for (let i = 0; i < testContents.length; i++) {
    const content = testContents[i];
    console.log(`Creating content ${i + 1}: ${content.title}`);
    console.log(`  Price: ${ethers.formatEther(content.price)} ETH`);
    
    const tx = await contract.createContent(content.price, content.metadataURI);
    const receipt = await tx.wait();
    
    // 解析事件获取 contentId
    for (const log of receipt!.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed?.name === "ContentCreated") {
          console.log(`  ✅ Content ID: ${parsed.args.contentId}`);
        }
      } catch {}
    }
    console.log("");
  }

  // 验证
  const totalContents = await contract.getTotalContents();
  console.log(`\n📊 Total contents on chain: ${totalContents}`);
  
  // 显示所有内容
  console.log("\n📋 Content List:");
  for (let i = 1; i <= Number(totalContents); i++) {
    const content = await contract.getContent(i);
    console.log(`  [${i}] Price: ${ethers.formatEther(content.currentPrice)} ETH, Active: ${content.active}`);
  }

  console.log("\n✅ Initialization complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

