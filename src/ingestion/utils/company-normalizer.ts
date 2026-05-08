export function normalizeCompanyName(input: string): string {
  let name = input.toLowerCase().trim();

  // remove punctuation
  name = name.replace(/[.,]/g, '');

  // remove suffixes
  name = name.replace(
    /\b(inc|incorporated|ltd|limited|corp|corporation|company|co)\b/g,
    ''
  );

  // normalize whitespace
  name = name.replace(/\s+/g, ' ').trim();

  // alias mapping (controlled overrides)
  name = applyAliases(name);

  return name;
}

function applyAliases(name: string): string {
  const aliases: Record<string, string> = {
    'stripe payments': 'stripe',
    'stripe inc': 'stripe',
    'openai inc': 'openai',
  };

  return aliases[name] ?? name;
}