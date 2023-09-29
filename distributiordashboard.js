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


const fs = require('fs');
const QRCode = require('qrcode');

// Data to be encoded in the QR code
const dataToEncode = 'this is data to encode kjdgdbg dkbfd'; // Change this to your desired data

// Generate the QR code as a data URL
QRCode.toDataURL(dataToEncode, (err, url) => {
  if (err) throw err;

  // Save the QR code as an image file (optional)
  fs.writeFileSync('qrcode.png', Buffer.from(url.split(',')[1], 'base64'));

  console.log('QR code generated and saved as qrcode.png');
});
