// Packages
import { join } from "path"

// Helpers
export async function getIvs(options) {
  const { events, ns, store } = options

  const { operations, projectPath } = store.get(ns)

  await events.fs([...ns, "encrypt", "ivs"], {
    action: "storeReadJson",
    ensure: true,
    json: {},
    path: join(projectPath, operations.encrypt.ivsPath),
  })
}

export async function writeIvs(options) {
  const { events, ivs, ns, store } = options

  const { operations, projectPath } = store.get(ns)

  for (const iv in ivs) {
    ivs[iv] = ivs[iv].toString("hex")
  }

  await events.fs([...ns, "encrypt", "ivs"], {
    action: "storeWriteJson",
    json: ivs,
    path: join(projectPath, operations.encrypt.ivsPath),
  })
}
