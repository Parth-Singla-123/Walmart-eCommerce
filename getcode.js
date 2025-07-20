// combine-files.js

const fs = require('fs');
const path = require('path');

// 1. Hard-coded source directory (change as needed):
const srcDir = path.join(__dirname, 'app/api');

// 2. Output file:
const outFile = path.join(__dirname, 'temp.txt');

// Initialize/clear temp.txt
fs.writeFileSync(outFile, '', 'utf8');

/**
 * Recursively walks `dir`, finds all .js files and
 * appends their path + content + 20 blank lines to temp.txt
 */
function processDir(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(dir, dirent.name);

        if (dirent.isDirectory() &&
            dirent.name !== 'node_modules' &&
            dirent.name !== 'public' &&
            dirent.name !== '.next') {
            processDir(fullPath);
        }
        else if (dirent.isFile() && dirent.name.endsWith('.js')) {
            // compute a POSIX-style relative path for the header
            let rel = path.relative(__dirname, fullPath).replace(/\\/g, '/');
            if (!rel.startsWith('/')) rel = '/' + rel;

            // 2.a Write the location header
            fs.appendFileSync(outFile, `File: ${rel}\n\n`, 'utf8');

            // 2.b Write the file’s contents
            const code = fs.readFileSync(fullPath, 'utf8');
            fs.appendFileSync(outFile, code.trimEnd() + '\n\n', 'utf8');

            // 3. Add 20 blank lines
            fs.appendFileSync(outFile, '\n'.repeat(20), 'utf8');
        }
    });
}

// kick it off
processDir(srcDir);
console.log(`✅ All .js files under "${srcDir}" combined into ${outFile}`);
