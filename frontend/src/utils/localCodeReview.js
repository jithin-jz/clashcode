export function generateLocalCodeReview({ code = "", challenge = null }) {
  const trimmed = (code || "").trim();
  const title = challenge?.title || "this challenge";
  const description = (challenge?.description || "").toLowerCase();

  const findings = [];
  const suggestions = [];
  const positives = [];

  if (!trimmed) {
    findings.push("Your editor is empty. There is no executable solution yet.");
    suggestions.push(
      "Start by implementing the required function from the starter code.",
    );
  }

  if (/\bpass\b/.test(trimmed)) {
    findings.push("`pass` is still present, so the function is incomplete.");
    suggestions.push(
      "Replace `pass` with real logic and return the expected value.",
    );
  }

  if (!/\breturn\b/.test(trimmed)) {
    findings.push("No `return` statement detected in your code.");
    suggestions.push(
      "Ensure the function returns the final output expected by tests.",
    );
  } else {
    positives.push(
      "A return statement is present, which is required for most challenge functions.",
    );
  }

  if (description.includes("set") && !/\bset\s*\(/.test(trimmed)) {
    findings.push(
      "Challenge asks for set conversion, but `set(...)` was not detected.",
    );
    suggestions.push("Use `set(items)` to remove duplicates efficiently.");
  }

  if (/for\s+\w+\s+in\s+\w+/.test(trimmed) && /append\s*\(/.test(trimmed)) {
    suggestions.push(
      "If you only need unique items, direct set conversion is simpler than manual loop + append.",
    );
  }

  const complexity = description.includes("set")
    ? "Using set conversion is typically O(n) time and O(n) space."
    : "Keep time complexity aligned with input size and avoid unnecessary nested loops.";

  const lines = [
    `### AI Review (Local Fallback)`,
    `Backend AI review endpoint is unavailable, so this review is generated in-app for **${title}**.`,
    "",
    "#### Findings",
    ...(findings.length
      ? findings.map((f) => `- ${f}`)
      : ["- No critical structural issues detected from static checks."]),
    "",
    "#### Suggestions",
    ...(suggestions.length
      ? suggestions.map((s) => `- ${s}`)
      : [
          "- Add edge-case tests and verify behavior with empty/invalid inputs.",
        ]),
    "",
    "#### Complexity",
    `- ${complexity}`,
  ];

  if (positives.length) {
    lines.push("", "#### Good Signals", ...positives.map((p) => `- ${p}`));
  }

  return lines.join("\n");
}
