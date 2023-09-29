const crypto = require('crypto');
const readline = require('readline');
const Blockchain = require('./Blockchain');

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

class Transaction {
  productId = 0;
  constructor(productId, quantity, sender, receiver) {
    this.productId = productId;
    this.quantity = quantity;
    this.sender = sender;
    this.receiver = receiver;
    this.timestamp = new Date().toISOString();
    this.signature = null;
  }
  

}


function addTransction(transaction){

    
    const { productId, quantity, sender, receiver, timestamp } = transaction;
        // Convert the transaction data to a JSON string
    const transactionDataString = JSON.stringify( {productId, quantity, sender, receiver ,timestamp});

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
    const { productId, quantity, sender, receiver, timestamp, signature } = transaction;
    const transactionDataString = JSON.stringify({ productId, quantity, sender, receiver, timestamp });

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


function acceptProduct() {
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
    const { productId, quantity, sender, receiver, timestamp } = transaction;
    console.log(`${index + 1}. Order: Product ID: ${productId}, Quantity: ${quantity}, Sender: ${sender}, Receiver: ${receiver}, Timestamp: ${timestamp}`);

  });

  rl.question('Enter the index of the transaction you want to accept: ', (selectedIndex) => {
    const index = parseInt(selectedIndex) - 1;

    if (index >= 0 && index < pendingTransactions.length) {
      const selectedTransaction = pendingTransactions[index];

      // Verify the selected transaction using the sender's public key
      const isVerified = verifyTransaction(selectedTransaction);

      if (isVerified) {
        // Transaction is valid, remove it from unverified transactions
        unverifiedTransactions = unverifiedTransactions.filter((t) => t.signature !== selectedTransaction.signature);

        // console.log('these are unverified transactions')
        // console.log(unverifiedTransactions);

        console.log('Transaction accepted.');
        verifiedTransactions.push(selectedTransaction);
        // console.log("this is verified transactions")
        // console.log(verifiedTransactions);
      } else {
        console.log('Transaction verification failed. The transaction is invalid.');
      }
    } else {
      console.log('Invalid index. Please enter a valid index.');
    }

    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
  });
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

function getMyPrivateKey() {
  const currentUser = admin.currentUser;
  if (currentUser) {
    return currentUser.getKeys().privateKey;
  } else {
    console.log('You need to be logged in to retrieve your private key.');
  }
}

function getMyPublicKey() {
  const currentUser = admin.currentUser;
  if (currentUser) {
    return currentUser.getKeys().publicKey;
  } else {
    console.log('You need to be logged in to retrieve your public key.');
  }
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
  switch (userType) {
    case 'client':
      console.log('1. Buy a Product');
      console.log('2. Accept a Product');
      console.log('3. Raise a Request');
      console.log('4. Track my order');
      console.log('5. Get My Keys'); // Added option for clients
      console.log('6. Logout');
      break;
    case 'distributor':
      console.log('1. Accept a Product from Manufacturer');
      console.log('2. Dispatch a Product to Client');
      console.log('3. Raise a Request');
      console.log('4. Get My Keys'); // Added option for distributors
      console.log('5. Logout');
      break;
    case 'manufacturer':
      console.log('1. Accept order from client');
      console.log('2. Dispatch a Product to Distributor');
      console.log('3. Find a Distributor');
      console.log('4. Get My Keys'); // Added option for manufacturers
      console.log('5. Logout');
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
          }else if(admin.currentUser.userType === 'manufacturer'){
            dispatchProduct();   
          }else if(admin.currentUser.userType === 'distributor'){
            dispatchProductDistributor();
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
  );
   addTransction(transaction);

  console.log(`Transaction successful! You bought ${quantity} ${product.name}(s).`);
  console.log(`Remaining stock of ${product.name}: ${product.quantity}`);
  displayLoggedInOptions(admin.currentUser.userType);
  processLoggedInInput(admin.currentUser.userType);
}

async function findDistributor(){
  const avaliabeDistributor = distributors_global.filter(d => d[1] === true);
  if(avaliabeDistributor.length === 0){
    console.log("None distributiors avaliable at the moment");
    
  }
  else{
    console.log("list of avaliable distributors")
    avaliabeDistributor.forEach(d => {
      console.log("Username : " ,d[0].username);
     

    });
  }

  displayLoggedInOptions(admin.currentUser.userType);
   processLoggedInInput(admin.currentUser.userType);
}

async function dispatchProduct() {

  rl.question('Enter Product ID: ', (productId) => {
    rl.question('Enter Quantity: ', (quantity) => {
      rl.question('Enter Dispatcher Name: ', (dispatcherName) => {
        // You can now use the entered values to create a transaction
        // For example, you can create a transaction object like this:

        const dispatch = new Transaction(
          parseInt(productId),
          parseInt(quantity),
          admin.currentUser.username, // Replace with the actual manufacturer's name
          dispatcherName
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
        console.log(`Transaction successful! You dispatched ${quantity} product(s) to ${dispatcherName}.`);

        // Display options and process input
        displayLoggedInOptions(admin.currentUser.userType);
        processLoggedInInput(admin.currentUser.userType);

        // Close the readline interface
        
      });
    });
  });
}

async function dispatchProductDistributor() {

  rl.question('Enter Product ID: ', (productId) => {
    rl.question('Enter Quantity: ', (quantity) => {
      rl.question('Enter Client Name: ', (dispatcherName) => {
        // You can now use the entered values to create a transaction
        // For example, you can create a transaction object like this:

        const dispatch = new Transaction(
          parseInt(productId),
          parseInt(quantity),
          admin.currentUser.username, // Replace with the actual manufacturer's name
          dispatcherName
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
        console.log(`Transaction successful! You dispatched ${quantity} product(s) to  client ${dispatcherName}.`);

        // Display options and process input
        displayLoggedInOptions(admin.currentUser.userType);
        processLoggedInInput(admin.currentUser.userType);

        // Close the readline interface
        
      });
    });
  });
}