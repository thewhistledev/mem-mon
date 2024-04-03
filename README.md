# mem-mon

`mem-mon` is a Node.js package that allows developers to monitor the memory usage of a specific package and its dependencies within their applications. It's designed to help identify potential memory leaks or high-memory-consuming packages, providing insights that can lead to more efficient memory usage in Node.js projects.

## Features

- Monitors and logs the memory usage of a specified package and its dependencies.
- Reports memory usage in megabytes (MB) for easy readability.
- Simple integration into existing Node.js applications or development workflows.

## Installation

To install `mem-mon`, use npm:

```bash
npm install mem-mon --save-dev
```
## Usage

To monitor the memory usage of a specific package and its dependencies, simply require `mem-mon` and invoke it with the name of the package you wish to monitor. Here's how you can do it:

```javascript
const monitorPackageMemoryUsage = require('mem-mon');

// Specify the package name you want to monitor
monitorPackageMemoryUsage('express');
```

This setup will initiate the memory monitoring for the specified package (`express` in the example above). When the process exits, `mem-mon` will log the memory usage of the specified package and its dependencies in megabytes (MB), providing you with insights into the memory footprint of the modules in use.

## Example

To illustrate how `mem-mon` can be used in a project, consider the following example where we monitor the memory usage of `express`, a popular web framework for Node.js:

```javascript
const monitorPackageMemoryUsage = require('mem-mon');

// Start monitoring memory usage of 'express'
monitorPackageMemoryUsage('express');
```
