import fs from 'node:fs/promises';

const README_PATH = process.env.README_PATH || 'README.md';
const COMMUNITY_HEADER = '# 🌟 Community Projects';
const COMMUNITY_END_HEADER = '## 📚 Learning Resources';
const MAX_AGE_MONTHS = Number.parseInt(process.env.MAX_AGE_MONTHS || '13', 10);
const FAIL_ON_FINDINGS = (process.env.FAIL_ON_FINDINGS || 'true').toLowerCase() !== 'false';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

function addMonths(date, months) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() - months);
  return next;
}

function parseGitHubReposFromCommunityProjects(readme) {
  const start = readme.indexOf(COMMUNITY_HEADER);
  const end = readme.indexOf(COMMUNITY_END_HEADER);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not locate the Community Projects section boundaries in README.md');
  }

  const section = readme.slice(start, end);
  const regex = /\(https:\/\/github\.com\/([^\s/)]+)\/([^\s/)]+)(?:\/[^)]*)?\)/g;
  const repos = new Map();

  for (const match of section.matchAll(regex)) {
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');
    const slug = `${owner}/${repo}`;

    if (!repos.has(slug)) {
      repos.set(slug, {
        owner,
        repo,
        slug,
        url: `https://github.com/${slug}`,
      });
    }
  }

  return [...repos.values()];
}

async function fetchRepo(slug) {
  const response = await fetch(`https://api.github.com/repos/${slug}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'awesome-langgraph-maintenance-script',
      ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API request failed for ${slug}: ${response.status} ${response.statusText} ${body}`);
  }

  return response.json();
}

function classifyRepo(repo, cutoffDate) {
  const pushedAt = repo.pushed_at ? new Date(repo.pushed_at) : null;
  const archived = Boolean(repo.archived);
  const outdated = pushedAt ? pushedAt < cutoffDate : true;

  return {
    slug: repo.full_name,
    url: repo.html_url,
    archived,
    pushedAt,
    outdated,
    reasons: [
      ...(archived ? ['archived'] : []),
      ...(outdated ? [`last push before cutoff (${pushedAt ? pushedAt.toISOString().slice(0, 10) : 'unknown'})`] : []),
    ],
  };
}

function buildSummary({ reposChecked, findings, cutoffDate }) {
  const lines = [];
  lines.push('# Outdated Project Check');
  lines.push('');
  lines.push(`- Repos checked: ${reposChecked}`);
  lines.push(`- Staleness cutoff: ${cutoffDate.toISOString().slice(0, 10)} (${MAX_AGE_MONTHS} months)`);
  lines.push(`- Findings: ${findings.length}`);
  lines.push('');

  if (findings.length === 0) {
    lines.push('No archived or outdated community projects found.');
    return lines.join('\n');
  }

  lines.push('| Repository | Last Push | Status |');
  lines.push('|---|---|---|');
  for (const finding of findings) {
    const lastPush = finding.pushedAt ? finding.pushedAt.toISOString().slice(0, 10) : 'unknown';
    lines.push(`| [${finding.slug}](${finding.url}) | ${lastPush} | ${finding.reasons.join(', ')} |`);
  }

  return lines.join('\n');
}

async function writeGitHubSummary(markdown) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  await fs.appendFile(summaryPath, `${markdown}\n`, 'utf8');
}

async function main() {
  const readme = await fs.readFile(README_PATH, 'utf8');
  const repos = parseGitHubReposFromCommunityProjects(readme);
  const cutoffDate = addMonths(new Date(), MAX_AGE_MONTHS);

  if (!GITHUB_TOKEN) {
    console.warn('Warning: GITHUB_TOKEN is not set. GitHub API rate limits may be too low for this check.');
  }

  const findings = [];

  for (const repo of repos) {
    const data = await fetchRepo(repo.slug);
    const finding = classifyRepo(data, cutoffDate);
    if (finding.archived || finding.outdated) {
      findings.push(finding);
    }
  }

  const summary = buildSummary({ reposChecked: repos.length, findings, cutoffDate });
  console.log(summary);
  await writeGitHubSummary(summary);

  if (findings.length > 0 && FAIL_ON_FINDINGS) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
