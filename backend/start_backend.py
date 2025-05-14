import os
import sys
import importlib
import subprocess

def check_dependencies():
    """Check if all dependencies are installed"""
    required_packages = [
        'fastapi', 'uvicorn', 'pydantic', 'numpy', 'pandas', 'scikit-learn',
        'pulp', 'pymongo', 'python-dotenv', 'ortools', 'pydantic-settings',
        'python-multipart'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✓ {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print(f"✗ {package} is missing")
    
    if missing_packages:
        print("\nInstalling missing packages...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", *missing_packages
        ])
        print("All packages installed successfully!")

def verify_app_imports():
    """Verify that the app imports correctly"""
    try:
        from app.main import app
        print("✓ App imports successfully")
        return True
    except Exception as e:
        print(f"✗ App import failed: {str(e)}")
        return False

def start_server():
    """Start the Uvicorn server"""
    print("\nStarting backend server...")
    os.system("uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    print("Checking dependencies...")
    check_dependencies()
    
    if verify_app_imports():
        start_server()
    else:
        print("\nCannot start server due to import errors.")
        sys.exit(1) 