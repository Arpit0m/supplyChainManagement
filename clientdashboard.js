const crypto = require('crypto');
const readline = require('readline');

// ... (Previous code for User, Admin, and productDistributionData)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

function displayOptions() {
  console.log('\nOptions:');
  console.log('1. Create New Distributor');
  console.log('2. Create New Client');
  console.log('3. Create New Manufacturer');
  console.log('4. Login');
  console.log('5. Exit');
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

function terminateProgram() {
  console.log('Exiting the program...');
  rl.close();
}

console.log('Welcome to the User Management System!');
displayOptions();
processInput();
