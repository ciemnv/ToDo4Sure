const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const root = process.cwd();
const files = ['app/_layout.tsx','app/modal.tsx','app/(tabs)/_layout.tsx','app/(tabs)/index.tsx','app/(tabs)/calendar.tsx','app/(tabs)/settings.tsx','components/ExternalLink.tsx','components/EditScreenInfo.tsx','components/StyledText.tsx','components/Themed.tsx'];
const results = [];
let currentFile = null;
function walk(node, parent, parentName) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'JSXText') {
    const text = node.value.replace(/\s+/g, '');
    if (text.length) {
      if (!parentName || !['Text', 'MonoText', 'StyledText'].includes(parentName)) {
        results.push({ file: currentFile, loc: node.loc.start, text: node.value.trim(), parentName });
      }
    }
  }
  if (node.type === 'JSXExpressionContainer' && node.expression) {
    const expr = node.expression;
    if (expr.type === 'StringLiteral' || expr.type === 'TemplateLiteral') {
      const value = expr.type === 'StringLiteral' ? expr.value : expr.quasis.map(q => q.value.cooked).join('');
      const text = String(value).replace(/\s+/g, '');
      if (text.length) {
        if (!parentName || !['Text', 'MonoText', 'StyledText'].includes(parentName)) {
          results.push({ file: currentFile, loc: node.loc.start, text: value.trim(), parentName });
        }
      }
    }
  }
  if (node.type === 'JSXElement') {
    const nameNode = node.openingElement.name;
    const name = nameNode.type === 'JSXIdentifier'
      ? nameNode.name
      : nameNode.type === 'JSXMemberExpression'
      ? nameNode.property.name
      : null;
    node.children.forEach(ch => walk(ch, node, name));
    return;
  }
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) value.forEach(ch => walk(ch, node, parentName));
    else walk(value, node, parentName);
  }
}
for (const rel of files) {
  const full = path.join(root, rel);
  const code = fs.readFileSync(full, 'utf8');
  currentFile = rel;
  const ast = parser.parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  walk(ast, null, null);
}
results.forEach(r => console.log(`${r.file}:${r.loc.line}:${r.loc.column} parent=${r.parentName} text=${JSON.stringify(r.text)}`));
