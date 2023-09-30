const crypto = require('crypto');
const readline = require('readline');
const Blockchain = require('./Blockchain');
const fs = require('fs');
const QRCode = require('qrcode');
 
// Data to be encoded in the QR code
 
 
 
 
// Global object to store product distribution data
const productDistributionData = {
  products: [
    { id: 1, name: 'Product A', quantity: 100 },
    { id: 2, name: 'Product B', quantity: 100 },
    { id: 3, name: 'Product C', quantity: 100 },
    { id: 4, name: 'Product D', quantity: 100 },
    { id: 5, name: 'Product E', quantity: 100 },
    { id: 6, name: 'Product F', quantity: 100 },
    { id: 7, name: 'Product G', quantity: 100 },
    { id: 8, name: 'Product H', quantity: 100 },
    { id: 9, name: 'Product I', quantity: 100 },
    { id: 10, name: 'Product J', quantity: 100 },
  ],
};
 
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const blockchain = new Blockchain();
 
 
function displayBlockchain() {
  blockchain.displayBlockchain();
  displayLoggedInOptions(admin.currentUser.userType);
  processLoggedInInput(admin.currentUser.userType);
}
 
let unverifiedTransactions = [];
let verifiedTransactions = [];
let users_global = [];
let distributors_global = [];
let candidates = [];
let miner  = null;
let tid_global = 0;
class Transaction {
  productId = 0;
  constructor(productId, quantity, sender, receiver, tid, client) {
    this.productId = productId;
    this.quantity = quantity;
    this.sender = sender;
    this.receiver = receiver;
    this.timestamp = new Date().toISOString();
    this.signature = null;
    this.tid = tid;
    this.client=client;
  }
  
 
}
 
 
function addTransction(transaction){
 
    
    const { productId, quantity, sender, receiver, timestamp, tid, client } = transaction;
        // Convert the transaction data to a JSON string
    const transactionDataString = JSON.stringify( {productId, quantity, sender, receiver ,timestamp, tid, client});
 
    // Create a signature
    const sign = crypto.createSign('SHA256');
    sign.update(transactionDataString);
    const user = users_global.find(u => u.username === sender);
    const signature = sign.sign(user.getKeys().privateKey, 'hex');
 
    // console.log('Transaction Data:', transactionDataString);
    // console.log('Signature:', signature);
    transaction.signature = signature;
 
    unverifiedTransactions.push(transaction);
    console.log('Transaction added to unverifiedTransactions:', transaction);
}
 
function verifyTransaction(transaction) {
    const { productId, quantity, sender, receiver, timestamp, signature, tid ,client} = transaction;
    const transactionDataString = JSON.stringify({ productId, quantity, sender, receiver, timestamp, tid , client});
 
    // Assuming you have access to the sender's public key
    const user = users_global.find(u => u.username === sender);
    const publicKey = user.getKeys().publicKey; // Replace with the actual public key
 
    const verify = crypto.createVerify('SHA256');
    verify.update(transactionDataString);
 
    // Verify the signature using the sender's public key
    const isSignatureValid = verify.verify(publicKey, signature, 'hex');
 
    if (isSignatureValid) {
        console.log('Transaction signature is valid.');
        return true;
        // Proceed with processing the transaction
    } else {
        console.log('Transaction signature is not valid. Reject the transaction.');
        return false;
    }
}
 
 
async function acceptProduct() {
  // if (admin.currentUser.userType !== 'manufacturer') {
  //   console.log('Only manufacturers can accept product requests.');
  //   displayLoggedInOptions(admin.currentUser.userType);
  //   processLoggedInInput(admin.currentUser.userType);
  //   return;
  // }
 
  // Filter unverified transactions with the manufacturer as the receiver
const pendingTransactions = unverifiedTransactions.filter((transaction) => transaction.receiver === admin.currentUser.username);
 
  if (pendingTransactions.length === 0) {
    console.log('No pending transactions to accept.');
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }
 
  console.log('Available transactions for acceptance:');
  pendingTransactions.forEach((transaction, index) => {
    const { productId, quantity, sender, receiver, timestamp, tid , client} = transaction;
    console.log(`${index + 1}. Order: Product ID: ${productId}, Quantity: ${quantity}, Sender: ${sender}, Receiver: ${receiver}, Timestamp: ${timestamp}, Tid:${tid}, client: ${client}`);
 
  });
 
  rl.question('Enter the index of the transaction you want to accept: ', (selectedIndex) => {
    const index = parseInt(selectedIndex) - 1;
 
    if (index >= 0 && index < pendingTransactions.length) {
      const selectedTransaction = pendingTransactions[index];
 
      // Verify the selected transaction using the sender's public key
      let isVerified = verifyTransaction(selectedTransaction);
 
      if (isVerified) {
        if(admin.currentUser.userType === "manufacturer"){
          if(!findDistributor()){
            displayLoggedInOptions(admin.currentUser.userType);
            processLoggedInInput(admin.currentUser.userType);
            return;
          }else{
            dispatchProduct(selectedTransaction)
            .then((success) => {
              if (success) {
                unverifiedTransactions = unverifiedTransactions.filter((t) => t.signature !== selectedTransaction.signature);
                verifiedTransactions.push(selectedTransaction);
                //console.log(verifiedTransactions);
                console.log("Accepted and dispatched the transction");
                
                  displayLoggedInOptions(admin.currentUser.userType);
                  processLoggedInInput(admin.currentUser.userType);
                  return;
 
              } else {
                // Handle the case where dispatching failed
                console.log('Failed to dispatch the product.');
                displayLoggedInOptions(admin.currentUser.userType);
                processLoggedInInput(admin.currentUser.userType);
                 return;
              }
            })
            .catch((error) => {
              // Handle any errors that may occur during dispatching
              console.error(error);
              displayLoggedInOptions(admin.currentUser.userType);
              processLoggedInInput(admin.currentUser.userType);
              return;
            });
          }
        }
        else if(admin.currentUser.userType === "distributor"){
          dispatchProductDistributor(selectedTransaction)
          .then((success) => {
            if (success) {
              unverifiedTransactions = unverifiedTransactions.filter((t) => t.signature !== selectedTransaction.signature);
              verifiedTransactions.push(selectedTransaction);
              console.log("Accepted and dispatched the Products");
                displayLoggedInOptions(admin.currentUser.userType);
                processLoggedInInput(admin.currentUser.userType);
                return;
 
            } else {
              // Handle the case where dispatching failed
              console.log('Failed to dispatch the product.');
              displayLoggedInOptions(admin.currentUser.userType);
              processLoggedInInput(admin.currentUser.userType);
               return;
            }
          })
          .catch((error) => {
            // Handle any errors that may occur during dispatching
            console.error(error);
            displayLoggedInOptions(admin.currentUser.userType);
            processLoggedInInput(admin.currentUser.userType);
            return;
          });
        }
 
 
        
        // Transaction is valid, remove it from unverified transactions
       
 
        
        // console.log("this is verified transactions")
        // console.log(verifiedTransactions);
      } else {
        console.log('Transaction verification failed. The transaction is invalid.');
      }
    } else {
      console.log('Invalid index. Please enter a valid index.');
    }
    
    
  });
}
 
function searchBlockChain(tidToFind) {
  let foundTransactions = [];
 
      for(let i = 0 ; i < blockchain.chain.length ; i++){
        blockchain.chain[i].transactions.forEach(tr => {
          if(tr.tid == tidToFind)
          foundTransactions.push(tr);
        })
      }
  
 // console.log(foundTransactions);
 
  return foundTransactions;
}
 
function searchVerifiedTransctions(tid){
  let foundTransactions = [];
 
  verifiedTransactions.forEach(e => {
    //console.log(e.tid);
    if(e.tid == tid){
      foundTransactions.push(e)
    }
  });
 
  //console.log(foundTransactions);
  return foundTransactions;
 
}
 
function generateUniqueFilename() {
  // Generate a unique filename based on the current timestamp
  const timestamp = new Date().getTime();
  return `qrcode_${timestamp}.png`;
}
 
function trackOrder() {
  rl.question('Enter the Transaction ID (tid) of the product you want to track: ', (tid) => {
    let data = searchBlockChain(tid);
    let d1 = searchVerifiedTransctions(tid);
    let qrdata = d1.concat(data)
   // console.log(qrdata);
    const qrdataString = JSON.stringify(qrdata);
 
    if (qrdata.length === 0) {
      qrdata = "Your order has been noted in progress, waiting for manager to accept.";
    }
 
    QRCode.toDataURL(qrdataString, (err, url) => {
      if (err) {
        console.error('Error generating QR code:', err);
      } else {
        const filename = generateUniqueFilename();
        const base64Data = url.split(',')[1];
 
        fs.writeFile(filename, Buffer.from(base64Data, 'base64'), (writeErr) => {
          if (writeErr) {
            console.error('Error saving QR code:', writeErr);
          } else {
            console.log(`QR code generated and saved as ${filename}`);
 
            // Display options after generating and saving the QR code
            displayLoggedInOptions(admin.currentUser.userType);
            processLoggedInInput(admin.currentUser.userType);
            return;
 
          }
        });
      }
    });
  });
}
 
 
function addToVotingPool(){
  if(candidates.length === 4){
    console.log('max capacity of candidates reached');
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }else{
    let vote  = 0;
    candidates.push([admin.currentUser,vote]);
    console.log("Added you to voting pool");
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }
}
 
function DPoSVoting(){
  if(candidates.length === 0){
    console.log("Not enough delgates");
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }
  
  let totalStake = 0;
  users_global.forEach(u => {
      totalStake += u.coins;
  });
 
  
  
  let maxVotes = 0;
 
  for(let i = 0 ; i < candidates.length ; i++){
    candidates[i][1] = totalStake*Math.random();
    if(candidates[i][1] >= maxVotes){
      miner = candidates[i][0];
      maxVotes = candidates[i][1];
     // console.log(miner)
    }
  }
 
  console.log("User : ", miner.username, " is selected for mining a block");
  console.log("------------------------Logout and mine block-----------------------------");
 
  
  
}
 
function mineBlock(){
  
    // if(!candidates.includes(admin.currentUser)){
    //   console.log("You must be a delegate to add a block");
    //   displayLoggedInOptions(admin.currentUser.userType);
    //   processLoggedInInput(admin.currentUser.userType);
    //   return;
    // }
 
    if(admin.currentUser.username !== miner.username){
      console.log("You are not authorized to mine a block");
      displayLoggedInOptions(admin.currentUser.userType);
      processLoggedInInput(admin.currentUser.userType);
      return;
    }
    
  
    if (verifiedTransactions.length >= 4) {
      // Gather the verified transactions to include in the new block
      const transactionsToMine = verifiedTransactions.slice(0, 4);
  
      // Create a new block with the verified transactions
     
  
      // Add the new block to the blockchain
      blockchain.addBlock(transactionsToMine);
  
      // Remove the mined transactions from the verifiedTransactions array
      verifiedTransactions = verifiedTransactions.slice(4);
  
      console.log('New block mined and added to the blockchain.');
      miner.coins += 10;
      console.log('Mining reward of 10 coins added to your account.');
      console.log('Delegates  refreshed');
      candidates = [];
 
    } else {
      console.log('Not enough verified transactions to mine a block.');
    }
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
 
}
 
class User {
  constructor(username, userType) {
    this.username = username;
    this.userType = userType;
    this.keyPair = this.generateKeyPair();
    this.coins = 100; // Initial coins for each user
  }
 
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024, // Key length
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
 
    return {
      publicKey,
      privateKey,
    };
  }
  getKeys() {
    return {
      publicKey: this.keyPair.publicKey,
      privateKey: this.keyPair.privateKey,
    };
  }
 
}
 
class Admin {
    constructor() {
      this.users = users_global;
      this.manufacturerCreated = false; // Flag to track manufacturer creation
      this.currentUser = null; // Track the currently logged-in user
      
    }
  
    createUser(username, userType) {
      const user = new User(username, userType);
      this.users.push(user);
      if(userType === 'distributor'){
        const isFree = true;
        distributors_global.push([user,isFree]);
      }
      console.log(`User ${username} created with type ${userType}`);
    }
  
    createManufacturer(username) {
      if (!this.manufacturerCreated) {
        const user = new User(username, 'manufacturer');
        this.users.push(user);
        console.log(`Manufacturer ${username} created.`);
        this.manufacturerCreated = true; // Set the flag to true after creation
      } else {
        console.log('Manufacturer already exists.');
      }
    }
  
    login(username) {
      const user = this.users.find((u) => u.username === username);
      if (user) {
        this.currentUser = user; // Set the current user after login
        console.log(`Logged in as ${username}`);
        return true;
      } else {
        console.log(`User ${username} not found.`);
        return false;
      }
    }
  
    logout() {
      this.currentUser = null; // Reset the current user after logout
      console.log('Logged out.');
    }
  }
const admin = new Admin();
 
function getMyKeys() {
  const currentUser = admin.currentUser;
  if (currentUser) {
    const keys = currentUser.getKeys();
    console.log(`${currentUser.username}'s Keys:`);
    console.log(`Public Key:\n${keys.publicKey}`);
    console.log(`Private Key:\n${keys.privateKey}`);
  } else {
    console.log('You need to be logged in to retrieve your keys.');
  }
  displayLoggedInOptions(currentUser.userType);
  processLoggedInInput(currentUser.userType);
}  
 
 
 
 
 
function getMyCoins(){
  console.log(admin.currentUser.coins);
  displayLoggedInOptions(admin.currentUser.userType)
  processLoggedInInput(admin.currentUser.userType)
}
 
function displayOptions() {
  console.log('\nOptions:');
  console.log('1. Create New Distributor');
  console.log('2. Create New Client');
  console.log('3. Create New Manufacturer');
  console.log('4. Login');
  console.log('5. Exit');
}
 
function displayLoggedInOptions(userType) {
  console.log(`\nLogged in as ${admin.currentUser.username} (${admin.currentUser.userType}):`);
 // console.log(verifiedTransactions);
  if(verifiedTransactions.length >= 4){
    console.log("Enough transction for mining a block");
    DPoSVoting();
  }
  switch (userType) {
    case 'client':
      console.log('1. Buy a Product');
      console.log('2. Accept a Product');
      console.log('3. Raise a Request');
      console.log('4. Track my order');
      console.log('5. Get My Keys'); // Added option for clients
      console.log('6. Logout');
      console.log('8. Become a delegate');
      console.log('9. Mine a block');
      console.log('10. Get my coins');
      console.log('11. Display Blockchain');
      break;
      case 'distributor':
        console.log('1. Accept a Product from Manufacturer');
        // console.log('2. Dispatch a Product to Client');
        console.log('3. Raise a Request');
        console.log('4. Get My Keys'); // Added option for distributors
        console.log('5. Logout');
        console.log('8. Become a delegate');
        console.log('9. Mine a block');
        console.log('10. Get my coins');
        console.log('11. Display Blockchain');
        break;
        case 'manufacturer':
          console.log('1. Accept order from client');
          // console.log('2. Dispatch a Product to Distributor');
          console.log('3. Find a Distributor');
          console.log('4. Get My Keys'); // Added option for manufacturers
          console.log('5. Logout');
          console.log('8. Become a delegate');
          console.log('9. Mine a block');
          console.log('10. Get my coins');
          console.log('11. Display Blockchain');
          break;
    default:
      console.log('Invalid user type.');
  }
}
 
 
function createNewUser(userType) {
  rl.question('Enter username: ', (username) => {
    admin.createUser(username, userType);
    displayOptions();
    processInput();
  });
}
 
function createManufacturer() {
  rl.question('Enter manufacturer username: ', (username) => {
    admin.createManufacturer(username);
    displayOptions();
    processInput();
  });
}
 
function login() {
    rl.question('Enter username to login: ', (username) => {
      if (admin.login(username)) {
        displayLoggedInOptions(admin.currentUser.userType);
        processLoggedInInput(admin.currentUser.userType);
      } else {
        displayOptions();
        processInput();
      }
    });
  }
 
function logout() {
    admin.logout();
    displayOptions();
    processInput();
  }
 
function terminateProgram() {
  console.log('Exiting the program...');
  rl.close();
}
 
function processLoggedInInput(userType) {
    rl.question('Select an option (1/2/3/4/5): ', (choice) => {
      switch (choice) {
        case '1':
          if(admin.currentUser.userType === 'client'){
            async function main() {
              await buyProduct();
              
            }
            main();
          }else if(admin.currentUser.userType === 'manufacturer'){
            acceptProduct();
          }else if(admin.currentUser.userType === 'distributor'){
            acceptProduct();
          }
 
          break;
        case '2':
          if(admin.currentUser.userType === 'client'){
            acceptProduct();
          }
          
         
          break;
        case '3':
          if(admin.currentUser.userType === 'client'){
            raiseRequest();
          }else if(admin.currentUser.userType === 'manufacturer'){
            findDistributor();
          }else if(admin.currentUser.userType === 'distributor'){
            raiseRequest();      
          }
          
          console.log('Option 3 selected.');
          break;
        case '4':
          if(admin.currentUser.userType === 'client'){
            trackOrder();
          }else if(admin.currentUser.userType === 'manufacturer'){
            getMyKeys();
          }else if(admin.currentUser.userType === 'distributor'){
            getMyKeys();
          }
          break;
        case '5':
          if(admin.currentUser.userType === 'client'){
            getMyKeys();
            
          }else{
            logout();
            
          }
          break;
        case '6':
          if(admin.currentUser.userType === 'client'){
            logout();
          }else{
            console.log('Invalid option. Please choose a valid option.');
            displayLoggedInOptions(userType);
            processLoggedInInput(userType);
          }  
          break;
 
          case '8':
            addToVotingPool();
          break;
          
          case '9':
            mineBlock();
          break;
          case '10':
            getMyCoins();
          break;  
          case '11':
            displayBlockchain();
            break;
        default:
          console.log('Invalid option. Please choose a valid option.');
          displayLoggedInOptions(userType);
          processLoggedInInput(userType);
      }
    });
  }
  
 
 
function processInput() {
  rl.question('Select an option (1/2/3/4/5): ', (choice) => {
    switch (choice) {
      case '1':
        createNewUser('distributor');
        break;
      case '2':
        createNewUser('client');
        break;
      case '3':
        createManufacturer();
        break;
      case '4':
        login();
        break;
      case '5':
        terminateProgram();
        break;
      default:
        console.log('Invalid option. Please choose a valid option.');
        displayOptions();
        processInput();
    }
  });
}
 
console.log('Welcome to the User Management System!');
displayOptions();
processInput();
 
 
async function buyProduct() {
  if (admin.currentUser.userType !== 'client') {
    console.log('Only clients can buy products.');
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }
 
  const productId = await new Promise((resolve) => {
    rl.question('Enter the product ID you want to buy: ', (input) => {
      resolve(input);
    });
  });
 
  const product = productDistributionData.products.find((p) => p.id === parseInt(productId));
 
  if (!product) {
    console.log('Product not found.');
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }
 
  if (product.quantity === 0) {
    console.log(`${product.name} is out of stock.`);
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }
 
  const quantity = await new Promise((resolve) => {
    rl.question(`Enter the quantity of ${product.name} you want to buy: `, (input) => {
      resolve(input);
    });
  });
 
  const client = admin.currentUser;
  const clientname = admin.currentUser.username;
 
  if (parseInt(quantity) > product.quantity) {
    console.log(`Only ${product.quantity} ${product.name}(s) are available.`);
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }
 
  // Update the product's quantity
  product.quantity -= parseInt(quantity);
 
  // Create a transaction for the purchase (you can modify the Transaction class accordingly)
  const transaction = new Transaction(
    product.id,
    parseInt(quantity),
    clientname,
    'manufacturer',
    tid_global++,
    clientname,
  );
   addTransction(transaction);
 
  console.log(`Transaction successful! You bought ${quantity} ${product.name}(s).`);
  console.log(`Remaining stock of ${product.name}: ${product.quantity}`);
  displayLoggedInOptions(admin.currentUser.userType);
  processLoggedInInput(admin.currentUser.userType);
}
 
 function findDistributor(){
  const avaliabeDistributor = distributors_global.filter(d => d[1] === true);
  if(avaliabeDistributor.length === 0){
    console.log("None distributiors avaliable at the moment");
    console.log("please create a distributer:");
    return false;
 
  }
  else{
    console.log("list of avaliable distributors")
    avaliabeDistributor.forEach(d => {
      console.log("Username : " ,d[0].username);
     
 
    });
  
    return true;
  }
 
  
}
 
async function dispatchProduct(transaction) {
  return new Promise((resolve, reject) => {
    console.log("inside dispatchProduct ------------");
    rl.question('Enter Dispatcher Name: ', (dispatcherName) => {
      // You can now use the entered values to create a transaction
      // For example, you can create a transaction object like this:
 
      const dispatch = new Transaction(
        transaction.productId,
        transaction.quantity,
        admin.currentUser.username, // Replace with the actual manufacturer's name
        dispatcherName,
        transaction.tid,
        transaction.client,
      );
 
      for (let i = 0; i < distributors_global.length; i++) {
        if (distributors_global[i][0].username === dispatcherName) {
          distributors_global[i][1] = false;
          break; // Exit the loop once found
        }
      }
 
      // Add the transaction
      addTransction(dispatch);
 
      // Print a success message
      console.log(`Transaction successful! You dispatched ${transaction.quantity} product(s) to ${dispatcherName}.`);
 
      // Resolve the Promise with true to indicate success
      resolve(true);
 
      // Close the readline interface
    });
  });
}
 
 
async function dispatchProductDistributor(transaction) {
  return new Promise((resolve, reject) => {
    rl.question('Enter Client Name: ', (dispatcherName) => {
      // You can now use the entered values to create a transaction
      // For example, you can create a transaction object like this:
 
      const dispatch = new Transaction(
        transaction.productId,
        transaction.quantity,
        admin.currentUser.username, // Replace with the actual manufacturer's name
        dispatcherName,
        transaction.tid,
        transaction.client,
      );
 
      for (let i = 0; i < distributors_global.length; i++) {
        if (distributors_global[i][0].username === dispatcherName) {
          distributors_global[i][1] = true;
          break; // Exit the loop once found
        }
      }
 
      // Add the transaction
      addTransction(dispatch);
 
      // Print a success message
      console.log(`Transaction successful! You dispatched ${transaction.quantity} product(s) to client ${transaction.client}.`);
 
      // Resolve the Promise with true to indicate success
      resolve(true);
 
 
      // Close the readline interface
    });
  });
}