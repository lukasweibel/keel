// tool.execute.before guard for OpenCode. Enforces Ground rule 2 from the
// keel skill mechanically: no edit/write outside doc/ while the active
// feature has not passed gate 1 yet.
//
// Known limitation: OpenCode plugin hooks currently do not intercept tool
// calls made by subagents (anomalyco/opencode#5894), so this guard only
// protects edits made by the main session.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

export const KeelGateGuard = async ({ directory }) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "edit" && input.tool !== "write") return

      const filePath = output.args?.filePath
      if (!filePath) return
      if (filePath.startsWith(join(directory, "doc") + "/")) return

      const docDir = join(directory, "doc")
      let stateFiles
      try {
        stateFiles = readdirSync(docDir)
          .map((name) => join(docDir, name, "keel-state.md"))
          .filter((p) => {
            try {
              return statSync(p).isFile()
            } catch {
              return false
            }
          })
      } catch {
        return
      }
      if (stateFiles.length === 0) return

      stateFiles.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
      const stateFile = stateFiles[0]
      const content = readFileSync(stateFile, "utf8")
      const phase = content.match(/^Phase:\s*(.+)$/m)?.[1]?.trim()

      if (phase === "inception") {
        const feature = stateFile.split("/").slice(-2, -1)[0]
        throw new Error(
          `keel: gate 1 for '${feature}' is not approved yet (phase: inception). No changes outside doc/ until then. See ${stateFile}.`,
        )
      }
    },
  }
}
