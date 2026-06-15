import { generateFiles, type OutputFile } from 'fumadocs-openapi';
import { openapi } from '@/lib/openapi';
import { rm } from 'node:fs/promises';

await rm('./content/docs/api', { recursive: true, force: true });

await generateFiles({
  input: openapi,
  output: './content/docs/api',
  includeDescription: true,
  groupBy: 'tag',
  name(output) {
    if (output.type !== 'operation') return 'index';

    const operation = this.document.paths?.[output.item.path]?.[output.item.method];
    const title = operation?.summary ?? `${output.item.method} ${output.item.path}`;

    return `${output.item.method}-${slugify(title)}`;
  },
  meta: true,
  beforeWrite(files) {
    updateRootMeta(files);
  },
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function updateRootMeta(files: OutputFile[]) {
  const meta = files.find((file) => file.path === 'meta.json');
  if (!meta) return;

  const data = JSON.parse(meta.content) as {
    pages?: string[];
    title?: string;
    defaultOpen?: boolean;
  };

  meta.content = JSON.stringify(
    {
      title: 'API Reference',
      defaultOpen: true,
      pages: [
        'admin',
        'auth',
        'me',
        'users',
        'organizations',
        'members',
        'jwks',
      ],
    },
    null,
    2,
  );
}
