# Multisig contract is based on Gnosis Safe multisig contract.
However, since we do not wish this contract to be upgradeable, we have cut out all relevant functionality.

This contract has a set of owners and a threshold that are specified in the constructor and can no longer be changed.

## The following functionality is implemented in the contract:

### Function `execTransaction`
Executes `operation` {0: Call, 1: DelegateCall} transaction to `to` with `value` (Native Currency) and pays `gasPrice` * `gasLimit` in `gasToken` token to `refundReceiver`.

Also, accepts a set of signatures as a parameter. It is important that the signatures should be sorted by the addresses of the owners (signers) from smaller to larger to avoid double signatures.

If the number of signatures is greater than or equal to the threshold and all signatures are valid, the transaction will work successfully.

Further checking of the signatures takes place in the `checkNSignatures` function.

### Function `approveHash`
Allow owner to approve hash (The main way to sign transaction).

After the transaction has been signed using the `approveHash` function, the offchain creates a signature that looks like this:
```ts
"0x000000000000000000000000" + owner_addr.slice(2,) + "000000000000000000000000" + owner_addr.slice(2,) + "01"
```

- Authorized role: owner

### Function `checkNSignatures`
First, it checks the length of the signatures, making sure there are enough of them.
Then it parses the signatures and starts iteratively working with each one:
1) Extracts the signer's address from the signature
2) Verifies that the specified address has signed the transaction passed for verification using the `approveHash` function.
3) Checks that the signers are sorted strictly in ascending order.

### Function `simulateAndRevert`
Simulation function to check the calldata

## The basic method of operation of the multisig is as follows:
1) A transaction is proposed (the initiator is the first to sign it using the `approveHash` function)
2) Signatures are collected from the other owners of the multisig using the same method (using the `approveHash` function) until the required number of signatures is collected.
3) The last signer initiates the transaction
