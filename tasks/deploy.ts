import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const TASK_DEPLOY_MULTISIG = "deploy:multisig"
export const TASK_DEPLOY_USDKG = "deploy:usdkg"

task(TASK_DEPLOY_MULTISIG, "Deploy multisig")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const artifact = await hre.artifacts.readArtifact("Multisig")
        const [deployer] = await hre.ethers.getSigners()
        console.log(`Deploing from: ${deployer.address}`)
        const c = await hre.ethers.deployContract(`${artifact.sourceName}:${artifact.contractName}`, [["0x03661b74e5f83707205f1cbE7D5A5eB0a080C97f", "0xC416a7829B559c6C3Ac0f5B469097a269596d79D", "0xE6126474888163F7462EA4a96Eec9b28dad1491C"], 2])
        await c.waitForDeployment()
        console.log(`${artifact.contractName}: ${await c.getAddress()}`)
        console.log(`npx hardhat --network ${hre.network.name} verify ${await c.getAddress()}`);
        return c;
    })

task(TASK_DEPLOY_USDKG, "Deploy stable")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const artifact = await hre.artifacts.readArtifact("USDKG")
        const [deployer] = await hre.ethers.getSigners()
        console.log(`Deploing from: ${deployer.address}`)
        const c = await hre.ethers.deployContract(`${artifact.sourceName}:${artifact.contractName}`, ["0xAC356bB294942bBe90659e2C439938dB1B3Cc563", "0xAC356bB294942bBe90659e2C439938dB1B3Cc563"])
        await c.waitForDeployment()
        console.log(`${artifact.contractName}: ${await c.getAddress()}`)
        console.log(`npx hardhat --network ${hre.network.name} verify ${await c.getAddress()}`);
        return c;
    })