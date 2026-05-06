# Contributing to Awesome LangGraph Ecosystem

This repository is curated. Contributions are welcome, but submissions must meet the rules below.

## What We Accept

- Broken link fixes
- Better descriptions or categorization
- New categories when they improve discoverability
- Community and official projects with clear LangChain or LangGraph relevance

## Baseline Rules for New Project Submissions

If you are adding a community project:

- The repository clearly shows real LangChain or LangGraph usage in its README, docs, or code.
- The repository is public, not archived, and has recent activity.
- The entry belongs in exactly one section and is placed in alphabetical order within that section.
- The description is factual, concise, and under 200 characters.
- The description should explain what the project is. Do not use marketing copy, test counts, funding language, or hype claims.
- Link to the project root unless a subdirectory is the actual project and the root repo clearly documents it.
- One project per pull request.

## Minimum Requirements

- Community repositories must have at least 10 GitHub stars.
- Exceptions are allowed only when there is strong alternative evidence of adoption or quality.

## How to Contribute

### Fork the repository

Click the "Fork" button in the top right corner of the GitHub page.

### Create a branch

Use a focused branch name such as `add-project-name` or `fix-broken-link`.

```bash
git checkout -b add-project-name
```

### Make your changes

Edit `README.md` and follow the surrounding format exactly.

Example row:

```markdown
| [owner/repo](https://github.com/owner/repo) | Short factual description | ![GitHub stars](https://img.shields.io/github/stars/owner/repo?style=social) |
```

### Commit your changes

Use a clear commit message.

```bash
git commit -m "Add project-name to Developer Tools"
```

### Push your branch

```bash
git push origin add-project-name
```

### Open the pull request

Fill out the PR template completely.

## Formatting Rules

- Use the existing table format for community projects.
- Use the existing dropdown format for official projects and resources.
- Preserve capitalization and surrounding section structure.
- Include the existing GitHub star badge format when the section uses it.
- Keep descriptions neutral and readable.

## Review Policy

Maintainers may close pull requests when:

- the project does not meet the minimum requirements
- the project does not show real LangChain or LangGraph usage
- the change is in the wrong section or not alphabetized
- the description reads like marketing copy
- the PR adds multiple unrelated projects
- the submission duplicates an existing entry

## Other Useful Contributions

- Verify links and badges
- Improve category placement
- Suggest structural cleanups
- Help maintain translations and supporting docs
