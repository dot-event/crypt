// Packages
import { join } from "path"

// Helpers
import { makeKey } from "./cipher"
import { propsFn } from "./props"

export async function getKey(options) {
  const { events, password, store } = options
  const props = propsFn(options)

  const { operations, projectPath } = store.get(props())
  const path = join(projectPath, operations.encrypt.keyPath)

  if (password) {
    const json = makeKey(password)

    await events.fs(props("getKey"), {
      action: "writeJson",
      json,
      path,
    })

    return json
  } else {
    return await events.fs(props("getKey"), {
      action: "readJson",
      path: path,
    })
  }
}
