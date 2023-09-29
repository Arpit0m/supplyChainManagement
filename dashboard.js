const readline = require('readline');
const Blockchain = require('./Blockchain'); // Replace './Blockchain' with the actual path to your Blockchain class

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let unverifiedTransactions;

let verifiedTransactions;

const blockchain = new Blockchain();

function displayOptions() {
  console.log('\nBlockchain Options:');
  console.log('1. Add Block');
  console.log('2. Display Blockchain');
  console.log('3. Check Validity');
  console.log('4. Exit');
}

function addBlock() {
  rl.question('Enter 4 transaction data separated by commas (e.g., tx1,tx2,tx3,tx4): ', (input) => {
    const transactions = input.split(',').map(tx => tx.trim());
    blockchain.addBlock(transactions);
    console.log('New block added to the blockchain.');
    displayOptions();
    processInput();
  });
}

function displayBlockchain() {
  blockchain.displayBlockchain();
  displayOptions();
  processInput();
}

function checkValidity() {
  if (blockchain.isValidChain()) {
    console.log('Blockchain is valid.');
  } else {
    console.log('Blockchain is not valid.');
  }
  displayOptions();
  processInput();
}

function terminateProgram() {
  console.log('Exiting the program...');
  rl.close();
}

function processInput() {
  rl.question('Select an option (1/2/3/4): ', (choice) => {
    switch (choice) {
      case '1':
        addBlock();
        break;
      case '2':
        displayBlockchain();
        break;
      case '3':
        checkValidity();
        break;
      case '4':
        terminateProgram();
        break;
      default:
        console.log('Invalid option. Please choose a valid option.');
        displayOptions();
        processInput();
    }
  });
}

console.log('Welcome to the Blockchain Terminal!');
displayOptions();
processInput();


function buyProduct() {
  if (admin.currentUser.userType !== 'client') {
    console.log('Only clients can buy products.');
    displayLoggedInOptions(admin.currentUser.userType);
    processLoggedInInput(admin.currentUser.userType);
    return;
  }

  rl.question('Enter the product ID you want to buy: ', (productId) => {
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

    rl.question(`Enter the quantity of ${product.name} you want to buy: `, (quantity) => {
      const client = admin.currentUser;

      if (parseInt(quantity) > product.quantity) {
        console.log(`Only ${product.quantity} ${product.name}(s) are available.`);
        displayLoggedInOptions(admin.currentUser.userType);
        processLoggedInInput(admin.currentUser.userType);
        return;
      }

      // Update the product's quantity
      product.quantity -= parseInt(quantity);

      // Create a transaction for the purchase (you can modify the Transaction class accordingly)
      const transaction = new Transaction(product.id, parseInt(quantity), client, 'manufacturer', client.keyPair.privateKey);
      addTransaction(transaction);

      console.log(`Transaction successful! You bought ${quantity} ${product.name}(s).`);
      console.log(`Remaining stock of ${product.name}: ${product.quantity}`);
      displayLoggedInOptions(admin.currentUser.userType);
      processLoggedInInput(admin.currentUser.userType);
    });
  });
}