const crypto = require('crypto');

class Block {
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.merkleRoot = this.calculateMerkleRoot();
    this.hash = this.calculateHash();
  }

  calculateMerkleRoot() {
    // Ensure there are exactly 4 transactions in a block.
    if (this.transactions.length !== 4) {
      throw new Error('A block must have exactly 4 transactions.');
    }

    // Hash each transaction using SHA-256.
    let hashedTransactions = this.transactions.map(transaction => this.hash(transaction));

    // Calculate the Merkle root by recursively hashing pairs of transaction hashes.
    while (hashedTransactions.length > 1) {
      const newHashedTransactions = [];

      for (let i = 0; i < hashedTransactions.length; i += 2) {
        const hash1 = hashedTransactions[i];
        const hash2 = (i + 1 < hashedTransactions.length) ? hashedTransactions[i + 1] : '';
        const combinedHash = this.hash(hash1 + hash2);
        newHashedTransactions.push(combinedHash);
      }

      hashedTransactions = newHashedTransactions;
    }

    return hashedTransactions[0];
  }

  calculateHash() {
    // Calculate the hash of the block's data.
    const data = this.index + this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.merkleRoot;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  hash(data) {
    // Use SHA-256 for hashing individual transaction data.
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    const timestamp = new Date().toISOString();
    const transactions = ['genesisTransaction1', 'genesisTransaction2', 'genesisTransaction3', 'genesisTransaction4'];
    const index = 0;
    return new Block(index, timestamp, transactions, '0000000000000000000000000000000');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(transactions) {
    const previousBlock = this.getLatestBlock();
    const index = previousBlock.index + 1;
    const timestamp = new Date().toISOString();
    const newBlock = new Block(index, timestamp, transactions, previousBlock.hash);
    this.chain.push(newBlock);
  }

  isValidChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if the hash of the previous block matches the previousHash in the current block.
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // Check if the calculated hash of the current block is correct.
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Check if the Merkle root in the current block matches the calculated Merkle root.
    //   if (currentBlock.merkleRoot !== currentBlock.calculateMerkleRoot()) {
    //     return false;
    //   }
    }

    return true;
  }

  displayBlockchain() {
    console.log('\nBlockchain:');
    this.chain.forEach(block => {
      console.log('Block Index:', block.index);
      console.log('Timestamp:', block.timestamp);
      console.log('Transactions:', block.transactions);
      console.log('Merkle Root:', block.merkleRoot);
      console.log('Previous Hash:', block.previousHash);
      console.log('Block Hash:', block.hash);
      console.log('-----------------------------------');
    });
  }
}

module.exports = Blockchain;
