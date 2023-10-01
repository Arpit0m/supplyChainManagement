# supplyChainManagement
Blockchain based SCM system implementing DPoS
# Blockchain Implementation Documentation

## Introduction

This documentation provides an overview and explanation of the provided JavaScript code, which implements a basic blockchain and its associated components. Blockchain technology is commonly used in decentralized applications (DApps) and cryptocurrencies like Bitcoin. This implementation serves as a simplified example for educational purposes.

## Code Structure

The provided code consists of two classes: `Block` and `Blockchain`. These classes work together to create a blockchain, which is a chain of blocks that store a list of transactions.

### Block Class

The `Block` class represents an individual block within the blockchain. Each block contains the following attributes:

- `index`: An integer representing the position of the block in the blockchain.
- `timestamp`: A timestamp indicating when the block was created.
- `transactions`: An array of transactions (limited to 4 transactions in this example).
- `previousHash`: The hash of the previous block in the blockchain.
- `merkleRoot`: The Merkle root hash of the block's transactions.
- `hash`: The hash of the entire block, including its data.

#### Methods in the `Block` Class

1. `constructor(index, timestamp, transactions, previousHash = '')`: Initializes a new block with the provided data. If `previousHash` is not provided, it defaults to an empty string. The Merkle root and block hash are also calculated during initialization.

2. `calculateMerkleRoot()`**: Calculates the Merkle root hash of the block's transactions. It follows the Merkle tree structure to hash pairs of transaction hashes until a single root hash is obtained.

3. `calculateHash()`: Calculates the hash of the entire block by combining its index, timestamp, transactions, previous hash, and Merkle root, and then hashing the resulting data using the SHA-256 algorithm.

4. `hash(data)`: A helper function that hashes individual transaction data using the SHA-256 algorithm.

### Blockchain Class

The `Blockchain` class represents the blockchain itself and manages the blocks within it.

#### Methods in the `Blockchain` Class

1. `constructor()`: Initializes a new blockchain with a single genesis block.

2. `createGenesisBlock()`: Creates the initial block in the blockchain, often referred to as the "genesis" block. This block has predefined transactions and a previous hash of all zeros.

3. `getLatestBlock()`: Returns the most recent block in the blockchain.

4. `addBlock(transactions)`: Adds a new block to the blockchain with the provided transactions. It calculates the index, timestamp, and previous hash for the new block and appends it to the chain.

5. `isValidChain()`: Checks the integrity of the blockchain by verifying that each block's `previousHash` matches the hash of the previous block and that each block's hash is valid based on its data. The Merkle root check is currently commented out.

6. `displayBlockchain()`: Outputs the contents of the entire blockchain, including each block's index, timestamp, transactions, Merkle root, previous hash, and block hash.


#### Functions and classes in app

1. `Transaction` Class:
   - This class represents a blockchain transaction.
   - Constructor: It takes parameters like `productId`, `quantity`, `sender`, `receiver`, `tid` (Transaction ID), and `client` to initialize a transaction object.
   
2. `addTransction(transaction)` Function:
   - This function is used to add a transaction to the `unverifiedTransactions` array.
   - It calculates and adds a digital signature to the transaction for verification.
   - Parameters:
     - `transaction`: An instance of the `Transaction` class.
   - Returns: None

3. `verifyTransaction(transaction)` Function:
   - This function is used to verify the digital signature of a transaction.
   - It ensures that the sender's public key and signature match.
   - Parameters:
     - `transaction`: An instance of the `Transaction` class.
   - Returns: `true` if the signature is valid, `false` otherwise.

4. `acceptProduct()` Function:
   - This function is used to allow manufacturers and distributors to accept pending product transactions.
   - It lists pending transactions for acceptance and verifies each transaction before processing.
   - Parameters: None

5. `searchBlockChain(tidToFind)` Function:
   - This function searches the blockchain for transactions with a given Transaction ID (tid).
   - It returns an array of transactions matching the specified tid.
   - Parameters:
     - `tidToFind`: The Transaction ID to search for.
   - Returns: An array of matching transactions.

6. `searchVerifiedTransctions(tid)` Function:
   - This function searches verified transactions for a given Transaction ID (tid).
   - It returns an array of verified transactions matching the specified tid.
   - Parameters:
     - `tid`: The Transaction ID to search for.
   - Returns: An array of matching verified transactions.

7. `generateUniqueFilename()` Function:
   - This function generates a unique filename based on the current timestamp for saving QR codes.
   - Parameters: None
   - Returns: A unique filename as a string.

8. `trackOrder()` Function:
   - This function allows users to track the status of their orders using a Transaction ID (tid).
   - It generates a QR code containing order information.
   - Parameters: None

9. `addToVotingPool()` Function:
   - This function allows users to add themselves to the voting pool for selecting a miner.
   - Parameters: None

10. `DPoSVoting()` Function:
    - This function performs Delegated Proof of Stake (DPoS) voting to select a miner for block mining.
    - It selects a miner based on a random vote weighted by the user's stake (coins).
    - Parameters: None

11. `mineBlock()` Function:
    - This function allows the selected miner to mine a new block if there are enough verified transactions.
    - It creates a new block with verified transactions and adds it to the blockchain.
    - Parameters: None

12. `User` Class:
    - This class represents a user in the system.
    - Constructor: It takes a `username` and `userType` to initialize a user object.
    - Functions: `generateKeyPair()`, `getKeys()`.

13. `Admin` Class:
    - This class represents the system administrator.
    - Constructor: Initializes user management and tracking of the currently logged-in user.
    - Functions: `createUser()`, `createManufacturer()`, `login()`, `logout()`.

14. Various User Interaction Functions:
    - Functions like `createNewUser()`, `createManufacturer()`, `login()`, `logout()`, `terminateProgram()`, `processInput()`, `processLoggedInInput()`, and others handle user interactions, such as creating users, logging in, and logging out.



## Conclusion

This implementation provides a simplified demonstration of a blockchain and its key components. It's important to note that real-world blockchains are far more complex, secure, and efficient. This code is intended for educational purposes and does not cover all aspects of a production-ready blockchain system.
