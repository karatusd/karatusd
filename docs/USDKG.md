# USDKG is gold-backed stablecoin represented as ERC20 token.

The contract is managed by two addresses (multisigs): `Owner` and `Compliance`.

`Owner` can:
- Lock any transfers of token by calling `pause` function
- Unlock transfers of token by calling `unpause` function
- Mint new tokens to particular address by calling `issue` function
- Burn some tokens from particular address by calling `redeem` function
- Set fee parameters which, in basic terms, are equal to `0` and can reach a maximum of `0.2%`

`Compliance` can:
- Add particular address to black list by calling `addBlackList` function
- Remove particular address from black list by calling `removeBlackList` function
- Burn all tokens in the blacklisted account by calling `destroyBlackFunds` function

These addresses are set at the time the contract is deployed and can no longer be changed.

## The following functionality is implemented in the contract:

### Function `transfer`
Allows the user to send a certain number of tokens to another address.

If the fee value is not zero, it will be deducted from the transferred amount.

Additional requirements for calling the function:
- The protocol has not been blocked by the `pause` function
- The sender is not blacklisted

### Function `transferFrom`
Allows the user to send a certain number of tokens from one address to another.

If the fee value is not zero, it will be deducted from the transferred amount.

#### Additional requirements for calling the function:
- The protocol has not been blocked by the `pause` function
- The sender is not blacklisted
- User should have enough approveal from the spender's address

### Function `approve`
Approve the passed address to spend the specified amount of tokens on behalf of sender

If the specified size is equal to `type(uint256).max` then the specified address gets unlimited approval

### Function `pause`
Lock any transfers of this token.

#### Additional requirements for calling the function:
- The protocol has not been blocked by the `pause` function
- Authorized role: `owner`

### Function `unpause`
Unlock any transfers of this token.

#### Additional requirements for calling the function:
- The protocol has been blocked by the `pause` function
- Authorized role: `owner`

### Function `addBlackList`
Add specified address to black list.

#### Additional requirements for calling the function:
- Authorized role: `compliance`

### Function `removeBlackList`
Remove specified address from black list.

#### Additional requirements for calling the function:
- Authorized role: `compliance`

### Function `destroyBlackFunds`
Burn all tokens from the specified address.

#### Additional requirements for calling the function:
- Authorized role: `compliance`
- Specified address is blacklisted

### Function `issue`
Mint specified amount to specified address.

#### Additional requirements for calling the function:
- Authorized role: `owner`

### Function `redeem`
Burn specified amount from specified address.

#### Additional requirements for calling the function:
- Authorized role: `owner`

### Function `setParams`
Update fees values.

#### Additional requirements for calling the function:
- Authorized role: `owner`
- New value is less then `MAX_BASIS_POINTS`
