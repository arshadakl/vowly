/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'apps/web/app/components/templates/burgundy')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.vue'))

for (const file of files) {
  const filePath = path.join(dir, file)
  let content = fs.readFileSync(filePath, 'utf-8')

  // Also add @container to BurgundyTemplate.vue
  if (file === 'BurgundyTemplate.vue') {
    content = content.replace('class="w-full relative', 'class="@container w-full relative')
  }

  // Replace \b(sm|md|lg|xl|2xl): with @$1: but avoid matching @md:
  content = content.replace(/(?<!@)\b(sm|md|lg|xl|2xl):/g, '@$1:')

  fs.writeFileSync(filePath, content)
  globalThis.console.log(`Updated ${file}`)
}
