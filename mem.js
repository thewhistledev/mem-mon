/**
 * Monitors the memory usage of a specified package and its dependencies.
 * 
 * @param {string} packageName - The name of the package to monitor
 * @throws {Error} If packageName is not provided or is not a string
 * @throws {Error} If the package cannot be loaded
 * 
 * @example
 * const monitorPackageMemoryUsage = require('./mem.js');
 * monitorPackageMemoryUsage('express');
 */
function monitorPackageMemoryUsage(packageName) {
    // Validate input
    if (!packageName) {
        throw new Error('Package name is required');
    }
    if (typeof packageName !== 'string') {
        throw new Error('Package name must be a string');
    }

    const Module = require('module');
    const originalRequire = Module.prototype.require;
    const moduleMemoryUsage = {};
    let targetPackageLoaded = false;

    // Store initial memory state
    const initialHeapUsed = process.memoryUsage().heapUsed;

    Module.prototype.require = function(moduleName) {
        let result;
        
        try {
            // Track heap BEFORE require
            const heapBefore = process.memoryUsage().heapUsed;
            
            // Call the original require
            result = originalRequire.apply(this, arguments);
            
            // Start tracking after the target package is loaded
            if (moduleName === packageName) {
                targetPackageLoaded = true;
            }
            
            // Track memory delta for the target package and its dependencies
            if (targetPackageLoaded && !moduleMemoryUsage[moduleName]) {
                // Capture heap AFTER require completes
                const heapAfter = process.memoryUsage().heapUsed;
                // Store the delta, not the absolute value
                moduleMemoryUsage[moduleName] = heapAfter - heapBefore;
            }
            
            return result;
        } catch (error) {
            console.error(`Error requiring module '${moduleName}':`, error.message);
            throw error;
        }
    };

    // Register exit handler to log results
    process.on('exit', () => {
        try {
            const finalHeapUsed = process.memoryUsage().heapUsed;
            const totalMemoryDelta = finalHeapUsed - initialHeapUsed;
            
            console.log(`\n========================================`);
            console.log(`Memory Usage Report for '${packageName}'`);
            console.log(`========================================`);
            
            if (Object.keys(moduleMemoryUsage).length === 0) {
                console.log('No modules were tracked. Package may not have been loaded.');
            } else {
                const memoryUsageInMB = {};
                for (const moduleName in moduleMemoryUsage) {
                    const memoryInMB = (moduleMemoryUsage[moduleName] / (1024 * 1024)).toFixed(2);
                    memoryUsageInMB[moduleName] = memoryInMB + ' MB';
                }
                
                console.log('\nModule Memory Usage (Delta):');
                console.log(memoryUsageInMB);
                console.log(`\nTotal Heap Delta: ${(totalMemoryDelta / (1024 * 1024)).toFixed(2)} MB`);
            }
            
            console.log(`========================================\n`);
        } catch (error) {
            console.error('Error in exit handler:', error.message);
        }
    });

    // Attempt to load the target package
    try {
        originalRequire.apply(this, [packageName]);
    } catch (error) {
        console.error(`Failed to load package '${packageName}':`, error.message);
        // Rethrow instead of calling process.exit() to allow callers to handle the error
        throw error;
    }
}

module.exports = monitorPackageMemoryUsage;
