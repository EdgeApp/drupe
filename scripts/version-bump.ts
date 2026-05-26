import { readFileSync, writeFileSync } from "fs";
import select from "@inquirer/select";

interface Version {
  major: number;
  minor: number;
  patch: number;
}

function updateChangelog(changelogContent: string, newVersion: string): string {
  const lines = changelogContent.split("\n");
  const unreleasedIndex = lines.findIndex(
    (line) => line.trim() === "## Unreleased",
  );

  if (unreleasedIndex === -1) {
    throw new Error("CHANGELOG.md does not contain a '## Unreleased' section");
  }

  // Find the end of the Unreleased section (next ## heading or end of file)
  let unreleasedEndIndex = unreleasedIndex + 1;
  while (
    unreleasedEndIndex < lines.length &&
    !lines[unreleasedEndIndex].trim().startsWith("##")
  ) {
    unreleasedEndIndex++;
  }

  // Extract the Unreleased section content (excluding the header)
  let unreleasedLines = lines.slice(unreleasedIndex + 1, unreleasedEndIndex);

  // Trim leading blank lines
  while (unreleasedLines.length > 0 && unreleasedLines[0].trim() === "") {
    unreleasedLines = unreleasedLines.slice(1);
  }

  // Trim trailing blank lines
  while (
    unreleasedLines.length > 0 &&
    unreleasedLines[unreleasedLines.length - 1].trim() === ""
  ) {
    unreleasedLines = unreleasedLines.slice(0, -1);
  }

  // Check if there are any entries (lines starting with `-`)
  const hasEntries = unreleasedLines.some((line) =>
    line.trim().startsWith("-"),
  );

  if (!hasEntries) {
    throw new Error(
      "CHANGELOG.md '## Unreleased' section has no entries. Please add changelog entries before bumping the version.",
    );
  }

  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Keep Unreleased at the top (empty), insert version section below it
  const newLines = [
    ...lines.slice(0, unreleasedIndex),
    "## Unreleased",
    "",
    `## ${newVersion} (${dateString})`,
    "",
    ...unreleasedLines,
    "",
    ...lines.slice(unreleasedEndIndex),
  ];

  return newLines.join("\n");
}

async function main() {
  // Read current versions
  const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
  const jsrJson = JSON.parse(readFileSync("jsr.json", "utf-8"));
  const changelogContent = readFileSync("CHANGELOG.md", "utf-8");

  const currentVersion = packageJson.version;
  const current = parseVersion(currentVersion);

  // Calculate example versions for display
  const patchExample = formatVersion(bumpVersion(current, "patch"));
  const minorExample = formatVersion(bumpVersion(current, "minor"));
  const majorExample = formatVersion(bumpVersion(current, "major"));

  const bumpType = await select<"patch" | "minor" | "major">({
    message: `Current version: ${currentVersion}`,
    choices: [
      { name: `patch (${patchExample})`, value: "patch" },
      { name: `minor (${minorExample})`, value: "minor" },
      { name: `major (${majorExample})`, value: "major" },
    ],
  });

  // Calculate new version
  const newVersion = bumpVersion(current, bumpType);
  const newVersionString = formatVersion(newVersion);

  console.log(`\nBumping version: ${currentVersion} -> ${newVersionString}`);

  // Update CHANGELOG.md
  try {
    const updatedChangelog = updateChangelog(
      changelogContent,
      newVersionString,
    );
    writeFileSync("CHANGELOG.md", updatedChangelog);
    console.log("✓ Updated CHANGELOG.md");
  } catch (error) {
    console.error(
      `Error updating CHANGELOG.md: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exit(1);
  }

  // Update package.json
  packageJson.version = newVersionString;
  writeFileSync("package.json", JSON.stringify(packageJson, null, 2) + "\n");

  // Update jsr.json
  jsrJson.version = newVersionString;
  writeFileSync("jsr.json", JSON.stringify(jsrJson, null, 2) + "\n");

  console.log("✓ Updated package.json");
  console.log("✓ Updated jsr.json");
  console.log(`\nNew version: ${newVersionString}`);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

function parseVersion(version: string): Version {
  const parts = version.split(".").map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

function formatVersion(version: Version): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function bumpVersion(
  version: Version,
  type: "patch" | "minor" | "major",
): Version {
  switch (type) {
    case "patch":
      return { ...version, patch: version.patch + 1 };
    case "minor":
      return { ...version, minor: version.minor + 1, patch: 0 };
    case "major":
      return { ...version, major: version.major + 1, minor: 0, patch: 0 };
  }
}
