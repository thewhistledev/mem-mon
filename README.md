# mem-mon

> **Memory monitoring tool for Node.js packages and their dependencies**

A lightweight Node.js utility that measures and reports the memory footprint of individual packages and their dependencies with precision and clarity.

[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](./LICENSE)
[![npm version](https://img.shields.io/badge/npm-v0.2.21-brightgreen.svg)](https://www.npmjs.com/package/@thewhistledev/mem-mon)
[![Node.js Compatibility](https://img.shields.io/badge/node-%3E%3D12.0.0-green.svg)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Output Format](#output-format)
- [Error Handling](#error-handling)
- [How It Works](#how-it-works)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

`mem-mon` addresses a critical need in Node.js development: understanding the memory consumption of your dependencies. By intercepting the module loading process and tracking heap allocation, mem-mon provides developers with:

- **Accurate memory attribution** per module
- **Early detection** of memory-intensive packages
- **Dependency profiling** without external tools
- **Simple integration** into existing projects

This is particularly useful for:
- Identifying memory leaks during development
- Optimizing bundle sizes
- Making informed decisions about package choices
- Profiling CI/CD pipelines

---

## Features

- ✅ **Precise Memory Tracking** – Calculates per-module memory deltas, not absolute heap values
- ✅ **Dependency Profiling** – Monitors all dependencies of a specified package
- ✅ **Human-Readable Output** – Reports memory in megabytes (MB) with clear formatting
- ✅ **Minimal Overhead** – Zero external dependencies
- ✅ **Error Resilience** – Graceful error handling with informative messages
- ✅ **Input Validation** – Type checking and meaningful error messages
- ✅ **Process-Safe** – Won't terminate your application on error

---

## Installation

### Using npm

```bash
npm install @thewhistledev/mem-mon --save-dev
```

### Using yarn

```bash
yarn add @thewhistledev/mem-mon --dev
```

### Using pnpm

```bash
pnpm add -D @thewhistledev/mem-mon
```

---

## Quick Start

```javascript
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');

// Monitor memory usage of 'express' and its dependencies
monitorPackageMemoryUsage('express');
```

When your application exits, mem-mon will display a detailed memory report.

---

## Usage

### Basic Usage

```javascript
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');

// Start monitoring a package
monitorPackageMemoryUsage('express');
```

### With Error Handling

```javascript
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');

try {
    monitorPackageMemoryUsage('express');
} catch (error) {
    console.error('Failed to monitor package:', error.message);
    process.exit(1);
}
```

### In a Testing Context

```javascript
// test.js
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');

describe('Package Memory Usage', () => {
    before(() => {
        monitorPackageMemoryUsage('lodash');
    });

    it('should perform memory-efficient operations', () => {
        // Your tests here
    });
});
```

---

## API Reference

### `monitorPackageMemoryUsage(packageName)`

Initiates memory monitoring for the specified package and its dependencies.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `packageName` | `string` | Yes | The name of the package to monitor (e.g., `'express'`, `'lodash'`) |

#### Returns

`void` – Monitoring is registered on the process exit event.

#### Throws

- `Error` – If `packageName` is not provided
- `Error` – If `packageName` is not a string
- `Error` – If the specified package cannot be loaded

#### Example

```javascript
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');

// Valid
monitorPackageMemoryUsage('react');

// Invalid - will throw
monitorPackageMemoryUsage();           // Error: Package name is required
monitorPackageMemoryUsage(123);        // Error: Package name must be a string
monitorPackageMemoryUsage('nonexistent-pkg-xyz'); // Error: Cannot find module
```

---

## Output Format

When your process exits, mem-mon outputs a formatted memory report:

```
========================================
Memory Usage Report for 'express'
========================================

Module Memory Usage (Delta):
{
  'express': '0.35 MB',
  'body-parser': '0.12 MB',
  'router': '0.08 MB',
  'mime-types': '0.05 MB'
}

Total Heap Delta: 0.60 MB
========================================
```

### Understanding the Output

- **Module Memory Usage (Delta)** – Memory allocated by each module during require
- **Total Heap Delta** – Overall heap growth from when monitoring started to when the process exited
- Modules are listed in the order they were required

---

## Error Handling

mem-mon includes robust error handling for common scenarios:

### Missing Package Name

```javascript
monitorPackageMemoryUsage();
// Error: Package name is required
```

### Invalid Parameter Type

```javascript
monitorPackageMemoryUsage(123);
// Error: Package name must be a string
```

### Package Not Found

```javascript
monitorPackageMemoryUsage('nonexistent-package-xyz');
// Error: Failed to load package 'nonexistent-package-xyz': Cannot find module
```

### Handling Errors

```javascript
try {
    monitorPackageMemoryUsage('express');
} catch (error) {
    console.error('Error:', error.message);
    // Take corrective action
}
```

---

## How It Works

mem-mon works by instrumenting Node.js's module loading system:

1. **Intercepts require()** – Wraps `Module.prototype.require` to monitor module loads
2. **Captures heap snapshots** – Records heap memory before and after each module loads
3. **Calculates deltas** – Computes the memory delta for each module
4. **Tracks dependencies** – Records memory for all modules loaded after the target package
5. **Reports on exit** – Uses `process.on('exit')` to display a formatted summary

### Memory Measurement Strategy

```
Before Require:  Heap = X MB
After Require:   Heap = Y MB
Module Delta:    Y - X MB  ← This is what we track
```

This delta approach ensures:
- Small dependencies aren't misattributed as owning the entire heap
- Memory is fairly distributed among modules
- Results are consistent across runs

---

## Limitations

⚠️ **Important considerations when using mem-mon:**

### 1. **Garbage Collection Timing**
Memory measurements are sensitive to garbage collection cycles. Different runs may show slight variations due to GC timing.

```javascript
// GC may not have run yet during measurement
monitorPackageMemoryUsage('lodash');
```

### 2. **Heap Snapshot Limitations**
Measurements capture heap usage at specific points in time, not peak memory or total allocations.

### 3. **Synchronous Modules Only**
Does not track memory for modules that load asynchronously after require returns.

```javascript
// Only measures synchronous loading
monitorPackageMemoryUsage('express');

// Async module loading happens after require returns and is not tracked
```

### 4. **Development Use Recommended**
Best used in development or CI environments for package profiling, not production monitoring.

### 5. **Single Package Focus**
Can monitor one package at a time. For multiple packages, run separate instances.

### 6. **Process-Wide Heap**
Measures process-wide heap, not isolated memory per module. Results reflect total heap usage, not isolated allocations.

---

## Real-World Examples

### Comparing Package Alternatives

```javascript
// test-lodash-memory.js
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');
monitorPackageMemoryUsage('lodash');

// Output: lodash uses ~0.24 MB
```

```javascript
// test-underscore-memory.js
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');
monitorPackageMemoryUsage('underscore');

// Output: underscore uses ~0.18 MB
```

### Framework Profiling

```javascript
// Profile Express startup memory
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');
monitorPackageMemoryUsage('express');

const express = require('express');
const app = express();

// When process exits, see Express framework memory overhead
```

### Build Tool Analysis

```javascript
// Analyze webpack memory footprint
const monitorPackageMemoryUsage = require('@thewhistledev/mem-mon');
monitorPackageMemoryUsage('webpack');

const webpack = require('webpack');
// webpack will now report its memory usage on exit
```

---

## Contributing

Contributions are welcome! Please feel free to:

- Report bugs and issues
- Suggest improvements
- Submit pull requests
- Improve documentation

---

## License

GPL-3.0

See [LICENSE](./LICENSE) file for details.

---

## Author

**thewhistledev**

---

## Support

For issues, questions, or feature requests, please open an issue on [GitHub](https://github.com/thewhistledev/mem-mon/issues).

---

## Changelog

### v0.2.21
- Fixed per-module memory delta tracking
- Improved error handling
- Enhanced test suite
- Updated documentation

### v0.2.5
- Initial release
