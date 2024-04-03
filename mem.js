function monitorPackageMemoryUsage(packageName) {
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    const moduleMemoryUsage = {};

    Module.prototype.require = function(moduleName) {
        // Call the original require
        const result = originalRequire.apply(this, arguments);
        
        // Start monitoring after the target package is loaded
        if (moduleName === packageName || moduleMemoryUsage[packageName]) {
            const initialMemoryUsage = process.memoryUsage().heapUsed;
            // Check if the module (or one of its dependencies) is being required for the first time
            if (!moduleMemoryUsage[moduleName]) {
                const finalMemoryUsage = process.memoryUsage().heapUsed;
                moduleMemoryUsage[moduleName] = finalMemoryUsage - initialMemoryUsage;
            }
        }
        
        return result;
    };

    process.on('exit', () => {
        console.log(`Memory Usage by ${packageName} and Dependencies (MB):`);
        const memoryUsageInMB = {};
        for (const moduleName in moduleMemoryUsage) {
            memoryUsageInMB[moduleName] = (moduleMemoryUsage[moduleName] / (1024 * 1024)).toFixed(2) + ' MB';
        }
        console.log(memoryUsageInMB);
    });

    // Manually load the target package to start the monitoring
    originalRequire.apply(this, [packageName]);
}

module.exports = monitorPackageMemoryUsage;