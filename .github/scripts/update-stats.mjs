import { writeFile } from "node:fs/promises";

const username = process.env.GITHUB_USERNAME ?? "miniLV";
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

let page = 1;
let stars = 0;

while (true) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?type=owner&per_page=100&page=${page}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${await response.text()}`);
  }

  const repos = await response.json();
  stars += repos.reduce((total, repo) => total + repo.stargazers_count, 0);
  if (repos.length < 100) break;
  page += 1;
}

const updatedAt = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
}).format(new Date());

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="120" viewBox="0 0 360 120" role="img" aria-label="${username} has ${stars} GitHub stars">
  <style>
    .title { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #24292f; }
    .value { font: 700 42px 'Segoe UI', Ubuntu, Sans-Serif; fill: #0969da; }
    .meta { font: 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #57606a; }
  </style>
  <rect width="100%" height="100%" rx="10" fill="#f6f8fa" stroke="#d0d7de"/>
  <text x="24" y="34" class="title">GitHub Stars Received</text>
  <text x="24" y="80" class="value">★ ${stars}</text>
  <text x="24" y="104" class="meta">Updated ${updatedAt} UTC</text>
</svg>
`;

await writeFile("profile/github-stars.svg", svg);
