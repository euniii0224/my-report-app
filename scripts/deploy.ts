import hre from 'hardhat'
const { ethers } = hre

async function main() {
  const Report = await ethers.getContractFactory('Report')

  const report = await Report.deploy()

  await report.waitForDeployment()

  console.log('Contract deployed to:', await report.getAddress())
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

// import { ethers } from "hardhat";

// async function main() {
//   console.log("배포 시작...");

//   // 배포 지갑 확인
//   const [deployer] = await ethers.getSigners();
//   console.log("배포 지갑 주소:", deployer.address);

//   const balance = await ethers.provider.getBalance(deployer.address);
//   console.log("잔액:", ethers.formatEther(balance), "ETH");

//   // 컨트랙트 배포
//   const ReportFactory = await ethers.getContractFactory("Report");
//   const report = await ReportFactory.deploy();
//   await report.waitForDeployment();

//   const address = await report.getAddress();
//   console.log(" 컨트랙트 배포 완료!");
//   console.log(" 컨트랙트 주소:", address);
//   console.log(
//     " Sepolia 탐색기:",
//     `https://sepolia.etherscan.io/address/${address}`,
//   );
//   console.log("\n 이 주소를 팀원들에게 공유하세요!");
// }

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });
