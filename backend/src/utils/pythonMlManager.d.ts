/**
 * TypeScript definitions for Python ML Manager
 */

declare class PythonMlManager {
  constructor();
  
  /**
   * Start the Python ML API process
   */
  startPythonMlProcess(): Promise<boolean>;
  
  /**
   * Stop the Python ML process
   */
  stopPythonMlProcess(): Promise<boolean>;
  
  /**
   * Restart the Python ML process
   */
  restartPythonMlProcess(): Promise<boolean>;
  
  /**
   * Check if the Python ML process is running
   */
  isPythonMlRunning(): boolean;
  
  /**
   * Get health status of the ML service
   */
  getMlHealthStatus(): Promise<{
    status: 'online' | 'offline' | 'error';
    message?: string;
    [key: string]: any;
  }>;
  
  /**
   * Get performance stats from the ML service
   */
  getMlPerformanceStats(): Promise<any>;
}

declare const pythonMlManager: PythonMlManager;
export = pythonMlManager;