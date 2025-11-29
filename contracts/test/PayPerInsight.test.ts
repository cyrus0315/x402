import { expect } from "chai";
import { ethers } from "hardhat";
import { PayPerInsight } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PayPerInsight", function () {
  let contract: PayPerInsight;
  let owner: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let referrer: HardhatEthersSigner;

  const BASE_PRICE = ethers.parseEther("0.01"); // 0.01 ETH
  const METADATA_URI = "ipfs://QmTest123";

  beforeEach(async function () {
    [owner, creator, user1, user2, referrer] = await ethers.getSigners();
    
    const PayPerInsight = await ethers.getContractFactory("PayPerInsight");
    contract = await PayPerInsight.deploy();
    await contract.waitForDeployment();
  });

  describe("Content Creation", function () {
    it("Should create content successfully", async function () {
      const tx = await contract.connect(creator).createContent(BASE_PRICE, METADATA_URI);
      await tx.wait();

      const content = await contract.getContent(1);
      expect(content.creator).to.equal(creator.address);
      expect(content.basePrice).to.equal(BASE_PRICE);
      expect(content.metadataURI).to.equal(METADATA_URI);
      expect(content.active).to.be.true;
    });

    it("Should emit ContentCreated event", async function () {
      await expect(contract.connect(creator).createContent(BASE_PRICE, METADATA_URI))
        .to.emit(contract, "ContentCreated")
        .withArgs(1, creator.address, BASE_PRICE, METADATA_URI);
    });

    it("Should reject zero price", async function () {
      await expect(contract.connect(creator).createContent(0, METADATA_URI))
        .to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Unlocking Content", function () {
    beforeEach(async function () {
      await contract.connect(creator).createContent(BASE_PRICE, METADATA_URI);
    });

    it("Should unlock content and mint NFT", async function () {
      const tx = await contract.connect(user1).unlock(1, ethers.ZeroAddress, {
        value: BASE_PRICE,
      });
      await tx.wait();

      expect(await contract.hasUnlocked(1, user1.address)).to.be.true;
      expect(await contract.balanceOf(user1.address)).to.equal(1);
      expect(await contract.ownerOf(1)).to.equal(user1.address);
    });

    it("Should distribute revenue correctly without referrer", async function () {
      await contract.connect(user1).unlock(1, ethers.ZeroAddress, {
        value: BASE_PRICE,
      });

      const balance = await contract.getBalance(creator.address);
      // Creator gets 85% + 10% (referrer share) = 95%
      const expectedCreatorAmount = (BASE_PRICE * 9500n) / 10000n;
      expect(balance.creatorEarnings).to.equal(expectedCreatorAmount);
    });

    it("Should distribute revenue correctly with referrer", async function () {
      await contract.connect(user1).unlock(1, referrer.address, {
        value: BASE_PRICE,
      });

      const creatorBalance = await contract.getBalance(creator.address);
      const referrerBalance = await contract.getBalance(referrer.address);

      const expectedCreatorAmount = (BASE_PRICE * 8500n) / 10000n;
      const expectedReferrerAmount = (BASE_PRICE * 1000n) / 10000n;

      expect(creatorBalance.creatorEarnings).to.equal(expectedCreatorAmount);
      expect(referrerBalance.referrerEarnings).to.equal(expectedReferrerAmount);
    });

    it("Should reject double unlock", async function () {
      await contract.connect(user1).unlock(1, ethers.ZeroAddress, {
        value: BASE_PRICE,
      });

      await expect(
        contract.connect(user1).unlock(1, ethers.ZeroAddress, {
          value: BASE_PRICE,
        })
      ).to.be.revertedWith("Already unlocked");
    });

    it("Should reject insufficient payment", async function () {
      await expect(
        contract.connect(user1).unlock(1, ethers.ZeroAddress, {
          value: BASE_PRICE / 2n,
        })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Dynamic Pricing", function () {
    beforeEach(async function () {
      await contract.connect(creator).createContent(BASE_PRICE, METADATA_URI);
    });

    it("Should increase price after 10 unlocks", async function () {
      // Unlock 10 times
      const signers = await ethers.getSigners();
      for (let i = 0; i < 10; i++) {
        await contract.connect(signers[i + 5]).unlock(1, ethers.ZeroAddress, {
          value: await contract.getPrice(1),
        });
      }

      // Price should be 10% higher
      const newPrice = await contract.getPrice(1);
      const expectedPrice = (BASE_PRICE * 110n) / 100n;
      expect(newPrice).to.equal(expectedPrice);
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await contract.connect(creator).createContent(BASE_PRICE, METADATA_URI);
      await contract.connect(user1).unlock(1, referrer.address, {
        value: BASE_PRICE,
      });
    });

    it("Should allow creator to withdraw", async function () {
      const balanceBefore = await ethers.provider.getBalance(creator.address);
      const tx = await contract.connect(creator).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(creator.address);

      const expectedAmount = (BASE_PRICE * 8500n) / 10000n;
      expect(balanceAfter - balanceBefore + gasUsed).to.equal(expectedAmount);
    });

    it("Should allow referrer to withdraw", async function () {
      const balanceBefore = await ethers.provider.getBalance(referrer.address);
      const tx = await contract.connect(referrer).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(referrer.address);

      const expectedAmount = (BASE_PRICE * 1000n) / 10000n;
      expect(balanceAfter - balanceBefore + gasUsed).to.equal(expectedAmount);
    });

    it("Should allow owner to withdraw platform fees", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await contract.connect(owner).withdrawPlatform();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      const expectedAmount = (BASE_PRICE * 500n) / 10000n;
      expect(balanceAfter - balanceBefore + gasUsed).to.equal(expectedAmount);
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      await contract.connect(creator).createContent(BASE_PRICE, METADATA_URI);
    });

    it("Should grant access after unlock", async function () {
      expect(await contract.checkAccess(1, user1.address)).to.be.false;
      
      await contract.connect(user1).unlock(1, ethers.ZeroAddress, {
        value: BASE_PRICE,
      });
      
      expect(await contract.checkAccess(1, user1.address)).to.be.true;
    });

    it("Creator should be able to deactivate content", async function () {
      await contract.connect(creator).deactivateContent(1);
      const content = await contract.getContent(1);
      expect(content.active).to.be.false;
    });
  });
});

