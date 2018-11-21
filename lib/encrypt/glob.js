// Packages
import { join } from "path"

// Helpers
import { propsFn } from "./props"

export async function glob(options) {
  const { events, store } = options
  const props = propsFn(options)

  const { operations, projectPath } = store.get(props())

  await events.glob(props("encrypt", "glob"), {
    action: "storeGlob",
    pattern: join(projectPath, operations.encrypt.glob),
  })
}
