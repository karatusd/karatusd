const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("USDKG", function () {
    async function setup() {
        const [owner, compliance, user] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("USDKG");
        const USDKG = await Factory.connect(owner).deploy(owner, compliance);
        return {
            owner,
            compliance,
            user,
            USDKG
        }
    }

    context("Scenarios", function () {
        specify("Correct setup", async function () {
            const { owner, compliance, user, USDKG } = await setup()

            expect(await owner.getAddress()).to.be.eq(await USDKG.owner());
            expect(await compliance.getAddress()).to.be.eq(await USDKG.compliance());
            expect(await USDKG.totalSupply()).to.be.eq(0);
        })

        specify("Transfers", async function() {
            const { owner, compliance, user, USDKG } = await setup()

            await USDKG.connect(owner).issue(await owner.getAddress(), 5000 * 10**6)

            await expect(USDKG.connect(user).transfer(await owner.getAddress(), 1000000)).to.be.reverted
            await USDKG.connect(owner).transfer(await user.getAddress(), 1000000)
            expect(await USDKG.balanceOf(await user.getAddress())).to.be.gt(0)

            const ownerBalanceBefore = await USDKG.balanceOf(await owner.getAddress())

            await expect(USDKG.connect(owner).transferFrom(await user.getAddress(), await owner.getAddress(), 1000000)).to.be.reverted
            await USDKG.connect(user).approve(await owner.getAddress(), 500000)
            USDKG.connect(owner).transferFrom(await user.getAddress(), await owner.getAddress(), 500000)
            await expect(USDKG.connect(owner).transferFrom(await user.getAddress(), await owner.getAddress(), 500000)).to.be.reverted
            expect(await USDKG.balanceOf(await user.getAddress())).to.be.gt(0)
            expect(await USDKG.balanceOf(await owner.getAddress())).to.be.gt(ownerBalanceBefore)
        })

        specify("Pause", async function() {
            const { owner, compliance, user, USDKG } = await setup()

            await USDKG.connect(owner).issue(await owner.getAddress(), 5000 * 10**6)

            await expect(USDKG.connect(user).pause()).to.be.reverted
            await expect(USDKG.connect(compliance).pause()).to.be.reverted
            await USDKG.connect(owner).pause()

            await expect(USDKG.connect(owner).transfer(await user.getAddress(), 1000000)).to.be.reverted
            await USDKG.connect(owner).approve(await user.getAddress(), 1000000)

            await expect(USDKG.connect(user).transferFrom(await owner.getAddress(), await user.getAddress(), 1000000)).to.be.reverted

            await expect(USDKG.connect(user).unpause()).to.be.reverted
            await expect(USDKG.connect(compliance).unpause()).to.be.reverted
            await USDKG.connect(owner).unpause()

            await USDKG.connect(owner).transfer(await user.getAddress(), 1000000)
            const userBalanceBefore = await USDKG.balanceOf(user.getAddress())
            expect(userBalanceBefore).to.be.gt(0)
            await USDKG.connect(owner).approve(await user.getAddress(), 0)
            await USDKG.connect(owner).approve(await user.getAddress(), 2000000)
            await USDKG.connect(user).transferFrom(await owner.getAddress(), await user.getAddress(), 2000000)
            expect(await USDKG.balanceOf(user.getAddress())).to.be.gt(userBalanceBefore)
        })

        specify("BlackList", async function() {
            const { owner, compliance, user, USDKG } = await setup()

            await USDKG.connect(owner).issue(await owner.getAddress(), 5000 * 10**6)

            await expect(USDKG.connect(user).addBlackList(await user.getAddress())).to.be.reverted
            await expect(USDKG.connect(owner).addBlackList(await user.getAddress())).to.be.reverted
            await USDKG.connect(compliance).addBlackList(await user.getAddress())

            await USDKG.connect(owner).transfer(await user.getAddress(), 1000000)

            await expect(USDKG.connect(user).transfer(await owner.getAddress(), 1000000)).to.be.reverted

            await USDKG.connect(user).approve(await owner.getAddress(), 1000000)

            await expect(USDKG.connect(owner).transferFrom(await user.getAddress(), await owner.getAddress(), 1000000)).to.be.reverted

            await USDKG.connect(compliance).destroyBlackFunds(await user.getAddress())
            expect(await USDKG.balanceOf(await user.getAddress())).to.be.eq(0)

            await USDKG.connect(compliance).removeBlackList(await user.getAddress())

            await USDKG.connect(owner).transfer(await user.getAddress(), 1000000)

            await expect(USDKG.connect(user).transfer(await owner.getAddress(), 1000000)).to.not.be.reverted

            await expect(USDKG.connect(owner).transfer(await user.getAddress(), 1000000)).to.not.be.reverted

            await expect(USDKG.connect(owner).transferFrom(await user.getAddress(), await owner.getAddress(), 1000000)).to.not.be.reverted
        })

        specify("Issue and Redeem", async function() {
            const { owner, compliance, user, USDKG } = await setup()

            await USDKG.connect(owner).issue(await owner.getAddress(), 5000 * 10**6)

            const ownerBalanceBefore = await USDKG.balanceOf(await owner.getAddress())

            await expect(USDKG.connect(user).issue(await owner.getAddress(), 1000000)).to.be.reverted
            await expect(USDKG.connect(compliance).issue(await owner.getAddress(), 1000000)).to.be.reverted
            await USDKG.connect(owner).issue(await owner.getAddress(), 1000000)

            expect(await USDKG.balanceOf(await owner.getAddress())).to.be.gt(ownerBalanceBefore)

            await expect(USDKG.connect(user).redeem(await owner.getAddress(), 1000000)).to.be.reverted
            await expect(USDKG.connect(compliance).redeem(await owner.getAddress(), 1000000)).to.be.reverted
            await USDKG.connect(owner).redeem(await owner.getAddress(), 1000000)

            expect(await USDKG.balanceOf(await owner.getAddress())).to.be.eq(ownerBalanceBefore)

        })

        specify("SafeERC20 Integration Test", async function() {
            const { owner, compliance, user, USDKG } = await setup()

            const Factory = await ethers.getContractFactory("IntegrationTest");
            const IntegrationTest = await Factory.connect(owner).deploy(await USDKG.getAddress());

            const owner_addr = await owner.getAddress()
            const compliance_addr = await compliance.getAddress()
            const user_addr = await user.getAddress()
            const IntegrationTest_addr = await IntegrationTest.getAddress()

            await USDKG.connect(owner).issue(IntegrationTest_addr, 5000 * 10**6)

            let IntegrationTestBalanceBefore = await USDKG.balanceOf(IntegrationTest_addr)

            await IntegrationTest.safeTransfer_test(owner_addr, 1000 * 10**6)

            expect(IntegrationTestBalanceBefore).to.be.gt(await USDKG.balanceOf(IntegrationTest_addr))
            expect(await USDKG.balanceOf(owner_addr)).to.be.gt(0)

            IntegrationTestBalanceBefore = await USDKG.balanceOf(IntegrationTest_addr)

            await USDKG.connect(owner).approve(IntegrationTest_addr, 1000 * 10**6)

            await IntegrationTest.safeTransferFrom_test(owner_addr, IntegrationTest_addr, 1000 * 10**6)

            expect(await USDKG.balanceOf(IntegrationTest_addr)).to.be.gt(IntegrationTestBalanceBefore)
            expect(await USDKG.balanceOf(owner_addr)).to.be.eq(0)

            await IntegrationTest.safeIncreaseAllowance_test(owner_addr, 1000 * 10**6)
            expect(await USDKG.allowance(IntegrationTest_addr, owner_addr)).to.be.gt(0)

            await IntegrationTest.safeDecreaseAllowance_test(owner_addr, 1000 * 10**6)
            expect(await USDKG.allowance(IntegrationTest_addr, owner_addr)).to.be.eq(0)

            await IntegrationTest.forceApprove_test(owner_addr, 1000 * 10**6)
            expect(await USDKG.allowance(IntegrationTest_addr, owner_addr)).to.be.gt(0)
        })
    })
})