const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { spawn } = require('child_process');

// Check if package.json exists
function checkPackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error('Error: package.json not found. Are you in the correct directory?');
    process.exit(1);
  }
  console.log('✓ package.json found');
  return true;
}

// Check if node_modules exists, install if not
function checkNodeModules() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠ node_modules not found, installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✓ Dependencies installed successfully');
    } catch (error) {
      console.error('Error installing dependencies:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✓ node_modules found');
  }
  return true;
}

// Check if Next.js is properly installed and available
function checkNextJsInstallation() {
  try {
    // Check if .next directory exists, if not create it
    const nextDirPath = path.join(__dirname, '.next');
    if (!fs.existsSync(nextDirPath)) {
      console.log('⚠ .next directory not found, creating it...');
      fs.mkdirSync(nextDirPath, { recursive: true });
    }
    
    // Check if next is available in node_modules/.bin
    const nextBinPath = path.join(__dirname, 'node_modules', '.bin', 'next');
    if (fs.existsSync(nextBinPath)) {
      console.log('✓ Next.js binary found locally');
    } else {
      console.log('⚠ Next.js binary not found in local node_modules, will reinstall dependencies');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Next.js installation:', error.message);
    return false;
  }
}

// Ensure React versions are compatible
function ensureReactCompatibility() {
  try {
    // Check React versions to make sure they match
    const reactPkgPath = path.join(__dirname, 'node_modules', 'react', 'package.json');
    const reactDomPkgPath = path.join(__dirname, 'node_modules', 'react-dom', 'package.json');
    
    if (fs.existsSync(reactPkgPath) && fs.existsSync(reactDomPkgPath)) {
      const reactPkg = JSON.parse(fs.readFileSync(reactPkgPath, 'utf8'));
      const reactDomPkg = JSON.parse(fs.readFileSync(reactDomPkgPath, 'utf8'));
      
      console.log(`✓ React version: ${reactPkg.version}`);
      console.log(`✓ React DOM version: ${reactDomPkg.version}`);
      
      if (reactPkg.version !== reactDomPkg.version) {
        console.log('⚠ React and React DOM versions do not match. Reinstalling dependencies...');
        execSync('npm install react@latest react-dom@latest', { stdio: 'inherit' });
      }
    } else {
      console.log('⚠ React or React DOM package.json not found. Reinstalling dependencies...');
      execSync('npm install react@latest react-dom@latest', { stdio: 'inherit' });
    }
    
    return true;
  } catch (error) {
    console.error('Error checking React compatibility:', error.message);
    return false;
  }
}

// Start the Next.js development server
function startNextJs() {
  console.log('\nStarting Next.js development server...');
  
  // Use the local next installation
  const nextBinPath = path.join(__dirname, 'node_modules', '.bin', 'next');
  
  // Check for Windows or Unix
  const isWindows = process.platform === 'win32';
  const localNextCommand = isWindows ? nextBinPath : './node_modules/.bin/next';
  
  console.log(`Running: ${localNextCommand} dev`);
  
  // Use the local next binary directly
  const nextProcess = spawn(localNextCommand, ['dev'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  nextProcess.on('error', (error) => {
    console.error(`Failed to start Next.js server: ${error.message}`);
    console.log('Trying alternative method to start Next.js...');
    
    // Fallback to npm script
    const altProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    altProcess.on('error', (altError) => {
      console.error(`Failed to start Next.js server with alternative method: ${altError.message}`);
      process.exit(1);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('\nShutting down Next.js server...');
    nextProcess.kill();
    process.exit(0);
  });
}

// Main function
function main() {
  console.log('Preparing to start the frontend server...');
  
  // Run checks
  const packageJsonValid = checkPackageJson();
  const nodeModulesValid = checkNodeModules();
  const nextJsValid = checkNextJsInstallation();
  const reactValid = ensureReactCompatibility();
  
  if (packageJsonValid && nodeModulesValid && nextJsValid && reactValid) {
    startNextJs();
  } else {
    console.error('Failed to start frontend server due to errors.');
    process.exit(1);
  }
}

// Run the script
main(); 