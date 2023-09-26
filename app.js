const crypto = require('crypto');
const readline = require('readline');

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

class User {
  constructor(username, userType) {
    this.username = username;
    this.userType = userType;
    this.keyPair = this.generateKeyPair();
    this.coins = 100; // Initial coins for each user
  }

  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 50, // Key length
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
      this.users = [];
      this.manufacturerCreated = false; // Flag to track manufacturer creation
      this.currentUser = null; // Track the currently logged-in user
    }
  
    createUser(username, userType) {
      const user = new User(username, userType);
      this.users.push(user);
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
      console.log('1. Dispatch a Product to Distributor');
      console.log('2. Find a Distributor');
      console.log('3. Get My Keys'); // Added option for manufacturers
      console.log('4. Logout');
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
          if(currentUser.userType === 'manager'){
            addTransaction()
          }
          else if (current.userType === 'client') {
            makeProductRequest()
          }else{
            addTransaction();
          }
          console.log('Option 1 selected.');
          break;
        case '2':
          if(currentUser.userType === 'manager'){
            findDistributor();
          }
          else if (current.userType === 'client') {
            addTransaction();
          }else{
            addTransaction();
          }
          console.log('Option 2 selected.');
          break;
        case '3':
          if(currentUser.userType === 'manager'){
            logout();
          }
          else if (current.userType === 'client') {
            raiseRequest();
          }else{
            raiseRequest();
          }
          console.log('Option 3 selected.');
          break;
        case '4':
          if(currentUser.userType === 'manager'){
            console.log('Invalid option. Please choose a valid option.');
            displayLoggedInOptions(userType);
            processLoggedInInput(userType);
          }
          else if (current.userType === 'client') {
            trackOrder();
          }else{
            logout();
          }
          
          console.log('Option 4 selected.');
          break;
        case '5':
          if(currentUser.userType === 'client'){
            logout();
          }
          else{
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
