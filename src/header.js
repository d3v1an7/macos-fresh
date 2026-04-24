import pc from "picocolors";

export function sectionHeader(title) {
  const width = process.stdout.columns || 80;
  const border = pc.gray("=".repeat(width));
  return `\n${border}\n${title}\n${border}`;
}

export function printHeader(title) {
  console.log(sectionHeader(title));
}
