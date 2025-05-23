// Generated by Cursor and run by Agents
const fs = require("fs")

const input = fs.readFileSync("scenarios.txt", "utf-8")
const scenarioBlocks = input.split(/📘 Scenario/).slice(1)

function parseBlock(block, idx) {
  const lines = block.split("\n").map((l) => l.trim())
  const get = (label) => {
    const line = lines.find((l) => l.startsWith(label))
    return line ? line.replace(label, "").trim() : ""
  }
  const getList = (label) => {
    const start = lines.findIndex((l) => l.startsWith(label))
    if (start === -1) return []
    let i = start + 1
    const items = []
    while (i < lines.length && (lines[i].startsWith("•") || lines[i].startsWith("-"))) {
      items.push(lines[i].replace(/^[-•]\s*/, "").trim())
      i++
    }
    return items
  }
  const getBlock = (label, stopLabels) => {
    const start = lines.findIndex((l) => l.startsWith(label))
    if (start === -1) return ""
    let i = start + 1
    const block = []
    while (
      i < lines.length &&
      !stopLabels.some((stop) => lines[i].startsWith(stop)) &&
      !lines[i].startsWith("📘 Scenario")
    ) {
      if (lines[i] !== "") block.push(lines[i])
      i++
    }
    return block.join("\n")
  }

  return {
    id: idx + 1,
    title: (block.match(/#\d+:\s*(.*)/) || [])[1] || "",
    category: get("Category:"),
    environment: get("Environment:"),
    summary: get("Scenario Summary:") || get("Summary:"),
    whatHappened: get("What Happened:"),
    diagnosisSteps: getList("Diagnosis Steps:"),
    rootCause: get("Root Cause:"),
    fix: getBlock("Fix/Workaround:", [
      "Lessons Learned:",
      "How to Avoid:",
      "Category:",
      "Environment:",
      "Scenario Summary:",
      "Summary:",
      "What Happened:",
      "Diagnosis Steps:",
      "Root Cause:",
    ]),
    lessonsLearned: get("Lessons Learned:"),
    howToAvoid: getList("How to Avoid:"),
  }
}

const scenarios = scenarioBlocks.map(parseBlock)

const ts = `export const scenarios: Scenario[] = ${JSON.stringify(scenarios, null, 2)};\n`

fs.writeFileSync("scenarios.ts", ts)
console.log("scenarios.ts written with", scenarios.length, "scenarios.")
