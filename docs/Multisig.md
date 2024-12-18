# Multisig contract is based on Gnosis Safe multisig contract.
However, since we do not wish this contract to be upgradeable, we have cut out all relevant functionality.

This contract has a set of owners and a threshold that are specified in the constructor and can no longer be changed.

## The following functionality is implemented in the contract:

### Function `execTransaction`
Executes `operation` {0: Call, 1: DelegateCall} transaction to `to` with `value` (Native Currency) and pays `gasPrice` * `gasLimit` in `gasToken` token to `refundReceiver`.

All the checks of the approvals takes place in the `checkNApprovals` function.
If the checks passed correctly, the transaction starts executing.

### Function `approveHash`
Allow owner to approve hash (The way to sign transaction).

After the transaction has been signed using the `approveHash` function.

- Authorized role: owner

### Function `checkNApprovals`

The loop checks each owner to see if it has signed the passed hash using the `approveHash` functionю
If enough owners (>= passed threshold) have signed the transaction, it is considered approved.

### Function `simulateAndRevert`
Simulation function to check the calldata

## The basic method of operation of the multisig is as follows:
1) A transaction is proposed (the initiator is the first to sign it using the `approveHash` function)
2) Signatures are collected from the other owners of the multisig using the same method (using the `approveHash` function) until the required number of signatures is collected.
3) The last signer initiates the transaction
