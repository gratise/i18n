import { chmod, readFile, writeFile } from 'node:fs/promises';

const binPath = new URL('../dist/bin.cjs', import.meta.url);
const content = await readFile(binPath, 'utf8');
if (!content.startsWith('#!/usr/bin/env node')) {
  await writeFile(binPath, `#!/usr/bin/env node\n${content}`);
}
await chmod(binPath, 0o755);
