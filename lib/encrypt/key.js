// Packages
import { join } from "path"

// Helpers
import { makeKey } from "./cipher"

export async function getKey(options) {
  const { cwd, events, keyPath, ns, password } = options
  const path = join(cwd, keyPath)

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
