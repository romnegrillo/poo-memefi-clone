const hre = require('hardhat');

async function main() {
  const Token = await ethers.getContractFactory('PooTokenClone');
  const token = await Token.deploy();
  await token.waitForDeployment();

  console.log('Poo Token Clone Address: ', token.target);

  const Presale = await ethers.getContractFactory('PooTokenClonePresale');
  const presale = await Presale.deploy(token.target);
  await presale.waitForDeployment();

  console.log('Poo Token Clone Presale Address: ', presale.target);

  // Transfer 1600000000000 Tokens to TokenSwap contract
  await token.transfer(
    presale.target,
    ethers.parseEther(String(1600000000000))
  );

  // Set Token Swap contract address in Token smart contract
  await token.setTokenSwapContract(presale.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

