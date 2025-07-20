// save this as generate-tree.js in your project root

const fs   = require('fs')
const path = require('path')

// directories to skip
const EXCLUDE = new Set(['node_modules', '.next', 'public', '.git'])
const OUT_FILE = 'tree.txt'

function buildTree(dir, prefix = '') {
  let output = ''
  // read & filter
  const items = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => !EXCLUDE.has(d.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1
      if (!a.isDirectory() && b.isDirectory()) return  1
      return a.name.localeCompare(b.name)
    })

  items.forEach((item, i) => {
    const isLast = i === items.length - 1
    const pointer = isLast ? '└── ' : '├── '
    output += `${prefix}${pointer}${item.name}\n`

    if (item.isDirectory()) {
      const morePrefix = prefix + (isLast ? '    ' : '│   ')
      output += buildTree(path.join(dir, item.name), morePrefix)
    }
  })

  return output
}

// run & write file
const tree = buildTree(process.cwd())
fs.writeFileSync(path.join(process.cwd(), OUT_FILE), tree)
console.log(`✅ tree saved to ./${OUT_FILE}`)
