// Packages
import { join } from "path"

// Helpers
export async function glob(options) {
  const { events, ns, store } = options

  const { operations, projectPath } = store.get(ns)

  await events.glob([...ns, "encrypt", "glob"], {
    action: "storeGlob",
    pattern: join(projectPath, operations.encrypt.glob),
  })
}
