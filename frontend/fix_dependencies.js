const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running dependency fix script for Next.js compatibility issues...');

// Function to run a command and log its output
function runCommand(command) {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    return false;
  }
}

// Clean up existing installations
console.log('\n1. Cleaning up existing installations...');

// Delete node_modules
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('Removing node_modules directory...');
  try {
    if (process.platform === 'win32') {
      // On Windows, use rimraf or similar approach to avoid long path issues
      runCommand('npx rimraf node_modules');
    } else {
      runCommand('rm -rf node_modules');
    }
  } catch (error) {
    console.error(`Failed to remove node_modules: ${error.message}`);
  }
}

// Delete .next folder
if (fs.existsSync(path.join(__dirname, '.next'))) {
  console.log('Removing .next directory...');
  try {
    if (process.platform === 'win32') {
      runCommand('npx rimraf .next');
    } else {
      runCommand('rm -rf .next');
    }
  } catch (error) {
    console.error(`Failed to remove .next: ${error.message}`);
  }
}

// Delete package-lock.json
if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
  console.log('Removing package-lock.json...');
  try {
    fs.unlinkSync(path.join(__dirname, 'package-lock.json'));
  } catch (error) {
    console.error(`Failed to remove package-lock.json: ${error.message}`);
  }
}

// Install dependencies with specific versions known to work together
console.log('\n2. Installing compatible dependencies...');

// Install Next.js and React with compatible versions
const success = runCommand('npm install next@13.4.19 react@18.2.0 react-dom@18.2.0 --save');

if (success) {
  console.log('\n3. Installing remaining dependencies...');
  runCommand('npm install');
  
  console.log('\n4. Creating empty .next directory...');
  fs.mkdirSync(path.join(__dirname, '.next'), { recursive: true });
  
  console.log('\n✅ Dependency fix completed successfully!');
  console.log('You can now run the application using:');
  console.log('  npm run dev');
  console.log('  or');
  console.log('  node start_frontend.js');
} else {
  console.error('\n❌ Failed to fix dependencies.');
  console.error('Please try manually running:');
  console.error('  npm install next@13.4.19 react@18.2.0 react-dom@18.2.0 --save');
  console.error('  npm install');
} 