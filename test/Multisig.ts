const { expect } = require("chai");
const { ethers } = require("hardhat");

import { Interface } from "ethers";

let OWNER_ABI = [
    "function issue(address _to, uint256 amount)",
    "function redeem(uint256 amount)",
    "function setParams(uint256 newBasisPoints)",
    "function pause()",
    "function unpause()"
]

let COMPLIANCE_ABI = [
    "function addBlackList (address _evilUser)",
    "function removeBlackList (address _clearedUser)",
    "function destroyBlackFunds (address _blackListedUser)",
]

describe("Multisig", function () {
    async function setup() {
        let [owner1, owner2, owner3, user] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("Multisig");
        const owner1_addr = await owner1.getAddress()
        const owner2_addr = await owner2.getAddress()
        const owner3_addr = await owner3.getAddress()
        const user_addr = await user.getAddress()
        const owner = await Factory.connect(owner1).deploy([owner1_addr, owner2_addr, owner3_addr], 2);
        const compliance = await Factory.connect(owner1).deploy([owner1_addr, owner2_addr, owner3_addr], 2);
        const FactoryUSDKG = await ethers.getContractFactory("USDKG");
        const USDKG = await FactoryUSDKG.connect(owner1).deploy(owner, compliance);
        const owner_addr = await owner.getAddress()
        const compliance_addr = await compliance.getAddress()

        return {
            owner1,
            owner2,
            owner3,
            user,
            owner,
            compliance,
            USDKG,
            owner1_addr,
            owner2_addr,
            owner3_addr,
            user_addr,
            owner_addr,
            compliance_addr
        }
    }

    context("Scenarios", function () {
        specify("Correct setup", async function () {
            const {
                owner1,
                owner2,
                owner3,
                user,
                owner,
                compliance,
                USDKG,
                owner1_addr,
                owner2_addr,
                owner3_addr,
                user_addr,
                owner_addr,
                compliance_addr
            } = await setup()

            expect(await owner.getThreshold()).to.be.eq(2)
            expect(await owner.isOwner(owner1_addr)).to.be.eq(true)
            expect(await owner.isOwner(owner2_addr)).to.be.eq(true)
            expect(await owner.isOwner(owner3_addr)).to.be.eq(true)
            expect(await owner.isOwner(user_addr)).to.be.eq(false)

            expect(await compliance.getThreshold()).to.be.eq(2)
            expect(await compliance.isOwner(owner1_addr)).to.be.eq(true)
            expect(await compliance.isOwner(owner2_addr)).to.be.eq(true)
            expect(await compliance.isOwner(owner3_addr)).to.be.eq(true)
            expect(await compliance.isOwner(user_addr)).to.be.eq(false)
        })

        specify("Owner functions", async function() {
            const {
                owner1,
                owner2,
                owner3,
                user,
                owner,
                compliance,
                USDKG,
                owner1_addr,
                owner2_addr,
                owner3_addr,
                user_addr,
                owner_addr,
                compliance_addr
            } = await setup()

            let owner_iface = new Interface(OWNER_ABI);
            let tx_data = owner_iface.encodeFunctionData("issue", [ user_addr, 1000*1e6 ])

            let tx_hash = await owner.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await owner.nonce()
            )

            await owner.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )
            await owner.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await owner.connect(owner1).execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            expect(await USDKG.balanceOf(user_addr)).to.be.gt(0)
            await USDKG.connect(user).transfer(owner_addr, 1000*1e6)

            tx_data = owner_iface.encodeFunctionData("redeem", [1000*1e6])

            tx_hash = await owner.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await owner.nonce()
            )

            await owner.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )
            await owner.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await owner.connect(owner1).execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            expect(await USDKG.balanceOf(user_addr)).to.be.eq(0)
            expect(await USDKG.balanceOf(owner_addr)).to.be.eq(0)

            tx_data = owner_iface.encodeFunctionData("setParams", [ 10 ])

            tx_hash = await owner.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await owner.nonce()
            )

            await owner.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )
            await owner.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await owner.connect(owner1).execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            expect(await USDKG.basisPointsRate()).to.be.eq(10)

            tx_data = owner_iface.encodeFunctionData("issue", [ user_addr, 10000 * 1e6 ])

            tx_hash = await owner.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await owner.nonce()
            )

            await owner.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )
            await owner.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await owner.connect(owner1).execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            tx_data = owner_iface.encodeFunctionData("pause", [ ])

            tx_hash = await owner.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await owner.nonce()
            )

            await owner.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )
            await owner.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await owner.connect(owner1).execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            expect(await USDKG.paused()).to.be.eq(true)

            tx_data = owner_iface.encodeFunctionData("unpause", [ ])

            tx_hash = await owner.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await owner.nonce()
            )

            await owner.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )
            await owner.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await owner.connect(owner1).execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            expect(await USDKG.paused()).to.be.eq(false)
        })

        specify("Compliance functions", async function() {
            const {
                owner1,
                owner2,
                owner3,
                user,
                owner,
                compliance,
                USDKG,
                owner1_addr,
                owner2_addr,
                owner3_addr,
                user_addr,
                owner_addr,
                compliance_addr
            } = await setup()

            let compliance_iface = new Interface(COMPLIANCE_ABI);
            let tx_data = compliance_iface.encodeFunctionData("addBlackList", [ user_addr ])

            let tx_hash = await compliance.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await compliance.nonce()
            )

            await compliance.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )
            await compliance.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await compliance.execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            expect(await USDKG.isBlackListed(user_addr)).to.be.eq(true)

            tx_data = compliance_iface.encodeFunctionData("destroyBlackFunds", [ user_addr ])

            tx_hash = await compliance.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await compliance.nonce()
            )

            await compliance.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await expect ( compliance.execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            ) ).to.be.reverted

            await compliance.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await expect ( compliance.execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            ) ).to.be.not.reverted

            tx_data = compliance_iface.encodeFunctionData("removeBlackList", [ user_addr ])

            tx_hash = await compliance.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await compliance.nonce()
            )

            await compliance.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )
            await compliance.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await compliance.execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            expect(await USDKG.isBlackListed(user_addr)).to.be.eq(false)
        })

        specify("Transaction with approve", async function() {
            const {
                owner1,
                owner2,
                owner3,
                user,
                owner,
                compliance,
                USDKG,
                owner1_addr,
                owner2_addr,
                owner3_addr,
                user_addr,
                owner_addr,
                compliance_addr
            } = await setup()

            let owner_iface = new Interface(OWNER_ABI);
            let tx_data = owner_iface.encodeFunctionData("issue", [ user_addr, 1000*1e6 ])

            let tx_hash = await owner.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await owner.nonce()
            )

            await owner.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await owner.connect(owner2).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await owner.connect(owner1).execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )

            expect(await USDKG.balanceOf(user_addr)).to.be.gt(0)
            await USDKG.connect(user).transfer(owner_addr, 1000*1e6)

            tx_data = owner_iface.encodeFunctionData("redeem", [1000*1e6 ])

            tx_hash = await owner.getTransactionHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                await owner.nonce()
            )

            await owner.connect(owner1).approveHash(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                tx_hash
            )

            await expect( owner.connect(owner1).execTransaction(
                await USDKG.getAddress(),
                0,
                tx_data,
                0,
                0,
                0,
                0,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000"
            )).to.be.reverted

            expect(await USDKG.balanceOf(owner_addr)).to.be.gt(0)
        })
    })
})