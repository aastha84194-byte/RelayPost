const fs = require('fs');
const path = require('path');

const map = {
  'bg-white': 'dark:bg-slate-900',
  'text-dark-bg': 'dark:text-white',
  'border-gray-200': 'dark:border-slate-800',
  'border-slate-200': 'dark:border-slate-800',
  'border-b-gray-200': 'dark:border-b-slate-800',
  'bg-gray-50': 'dark:bg-slate-800',
  'hover:bg-gray-50': 'dark:hover:bg-slate-800/50',
  'group-hover:bg-gray-50': 'dark:group-hover:bg-slate-800/50',
  'text-gray-500': 'dark:text-slate-400',
  'text-gray-600': 'dark:text-slate-300',
  'text-gray-700': 'dark:text-slate-200',
  'text-gray-800': 'dark:text-slate-100',
  'text-slate-500': 'dark:text-slate-400',
  'text-slate-600': 'dark:text-slate-300',
  'text-slate-700': 'dark:text-slate-200',
  'text-slate-800': 'dark:text-slate-100',
  'bg-slate-50': 'dark:bg-slate-800',
  'bg-[#F8F9FB]': 'dark:bg-[#0f172a]',
  'md:bg-[#F8F9FB]': 'dark:md:bg-[#0f172a]',
  'text-black': 'dark:text-white',
  'bg-gray-100': 'dark:bg-slate-800',
  'hover:bg-gray-100': 'dark:hover:bg-slate-700',
  'border-gray-100': 'dark:border-slate-800',
  'divide-gray-100': 'dark:divide-slate-800',
  'divide-gray-200': 'dark:divide-slate-800',
  'shadow-sm': 'dark:shadow-none',
  'shadow-md': 'dark:shadow-none'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // match className="..." or className={`...`}
  const classNameRegex = /className=(["'])(.*?)\1|className=\{`([^`]*?)`\}/g;
  
  content = content.replace(classNameRegex, (match, quote, p2, p3) => {
    let classesStr = p2 !== undefined ? p2 : p3;
    let isTemplate = p3 !== undefined;
    
    let modified = classesStr;
    
    for (const [lightCls, darkCls] of Object.entries(map)) {
      // Create a regex to find the light class word
      const lightRegex = new RegExp(`(?:^|\\s)${lightCls.replace(/\[/g, '\\[').replace(/\]/g, '\\]')}(?:\\s|$)`);
      
      // Keep replacing as long as there's a match and it isn't followed by the darkCls
      if (lightRegex.test(modified) && !modified.includes(darkCls)) {
        modified += ` ${darkCls}`;
      }
    }
    
    // special handling for transition-colors which helps dark mode look smoother
    if (modified !== classesStr && !modified.includes('transition-')) {
       modified += ' transition-colors duration-300';
    }

    if (modified !== classesStr) {
      if (isTemplate) {
        return `className={\`${modified}\`}`;
      } else {
        return `className=${quote}${modified}${quote}`;
      }
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'app', 'components'));
processFile(path.join(__dirname, 'app', 'page.tsx'));
