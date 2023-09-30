// const crypto = require('crypto');

// function addTransaction(sender, receiver, productId, timestamp, privateKey) {
//   // Create the transaction object
//   const transaction = {
//     sender: sender,
//     receiver: receiver,
//     productId: productId,
//     timestamp: timestamp,
//   };

//   // Convert the transaction object to a JSON string
//   const transactionData = JSON.stringify(transaction);

//   // Sign the transaction using SHA-256 and the private key
//   const sign = crypto.createSign('SHA256');
//   sign.update(transactionData);
//   const signature = sign.sign(privateKey, 'hex');

//   // Add the signature to the transaction
//   transaction.signature = signature;

//   // In a real application, you would typically store the transaction
//   // or send it to a network for verification and storage.

//   // For now, let's log the transaction object with the signature
//   console.log('Transaction:', transaction);

//   // Return some result or confirmation
//   return "Transaction added successfully";
// }

// // Example usage:
// const senderPrivateKey = 'your-private-key-here'; // Replace with the actual private key
// const senderPublicKey = 'your-public-key-here';   // Replace with the actual public key

// addTransaction('Alice', 'Bob', '12345', Date.now(), senderPrivateKey);
//--------------------------------------------------------------------------------------------------


// const fs = require('fs');
// const QRCode = require('qrcode');

// // Data to be encoded in the QR code
// const dataToEncode = 'this is data to encode kjdgdbg dkbfd'; // Change this to your desired data

// // Generate the QR code as a data URL
// QRCode.toDataURL(dataToEncode, (err, url) => {
//   if (err) throw err;

//   // Save the QR code as an image file (optional)
//   fs.writeFileSync('qrcode.png', Buffer.from(url.split(',')[1], 'base64'));

//   console.log('QR code generated and saved as qrcode.png');
// });

class User {
  constructor(username, usertype, coins) {
    this.username = username;
    this.usertype = usertype;
    this.coins = coins;
    this.stake = 0; // Initialize stake to 0
  }
}

const candidates = [
  new User('User1', 'miner', 1000),
  new User('User2', 'miner', 1500),
  new User('User3', 'miner', 800),
  new User('User4', 'miner', 1200),
];

function DPoSVoting() {
  // Calculate the total stake of all candidates
  const totalStake = candidates.reduce((sum, user) => sum + user.coins, 0);

  // Randomly select a number between 0 and the total stake
  const randomStake = Math.random() * totalStake;

  let currentStake = 0;
  let selectedMiner = null;

  // Iterate through candidates to find the miner based on their stakes
  for (const candidate of candidates) {
    currentStake += candidate.coins;
    if (randomStake <= currentStake) {
      selectedMiner = candidate;
      break;
    }
  }

  if (selectedMiner) {
    console.log(`${selectedMiner.username} is the selected miner.`);
  } else {
    console.log('No miner selected.');
  }
}

// Run the DPoS voting system
DPoSVoting();

