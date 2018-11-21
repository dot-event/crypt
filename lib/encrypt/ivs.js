// Packages
import { join } from "path"

// Helpers
export async function getIvs(options) {
  const { cwd, events, ivsPath, ns } = options

  await events.fs([...ns, "encrypt", "ivs"], {
    action: "storeReadJson",
    ensure: true,
    json: {},
    path: join(cwd, ivsPath),
  })
}

export async function writeIvs(options) {
  const { cwd, events, ivs, ivsPath, ns } = options

  for (const iv in ivs) {
    ivs[iv] = ivs[iv].toString("hex")
  }

  await events.fs([...ns, "encrypt", "ivs"], {
    action: "storeWriteJson",
    json: ivs,
    path: join(cwd, ivsPath),
  })
}
