#!/usr/bin/env python3
"""
Script to start the enhanced ML recommendation API
"""

import subprocess
import sys
import os
import signal
import time

def start_ml_api():
    """Start the enhanced ML recommendation API server"""
    print("Starting Enhanced ML Recommendation API Server...")
    
    # Change to the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Command to start the enhanced ML API
    cmd = [
        sys.executable, 
        "-u",  # Unbuffered output
        "ml_recommendation_api_enhanced.py"
    ]
    
    try:
        # Start the process
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        print(f"Enhanced ML API server started with PID: {process.pid}")
        print("Server is running on http://localhost:5001")
        
        # Monitor the process
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                print(output.strip())
        
        # Wait for the process to finish
        rc = process.poll()
        return rc
        
    except KeyboardInterrupt:
        print("\nShutting down Enhanced ML API server...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        print("Enhanced ML API server stopped.")
    except Exception as e:
        print(f"Error starting Enhanced ML API server: {e}")
        return 1

if __name__ == "__main__":
    exit_code = start_ml_api()
    sys.exit(exit_code)