// Packages
import { join } from "path"

// Helpers
import { makeKey } from "./cipher"

export async function getKey(options) {
  const { events, ns, password, store } = options

  const { operations, projectPath } = store.get(ns)
  const path = join(projectPath, operations.encrypt.keyPath)

  if (password) {
    const json = makeKey(password)

    await events.fs([...ns, "encrypt", "key"], {
      action: "storeWriteJson",
      json,
      path,
    })

    return json
  } else {
    await events.fs([...ns, "encrypt", "key"], {
      action: "storeReadJson",
      path: path,
    })
  }
}
