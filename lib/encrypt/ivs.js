// Packages
import { join } from "path"

// Helpers
import { propsFn } from "./props"

export async function getIvs(options) {
  const { events, store } = options
  const props = propsFn(options)

  const { operations, projectPath } = store.get(props())

  return await events.fs(props("encrypt", "ivs"), {
    action: "readJson",
    ensure: true,
    json: {},
    path: join(projectPath, operations.encrypt.ivsPath),
  })
}

export async function writeIvs(options) {
  const { events, ivs, store } = options
  const props = propsFn(options)

  const { operations, projectPath } = store.get(props())

  for (const iv in ivs) {
    ivs[iv] = ivs[iv].toString("hex")
  }

  return await events.fs(props("encrypt", "ivs"), {
    action: "writeJson",
    json: ivs,
    path: join(projectPath, operations.encrypt.ivsPath),
  })
}
