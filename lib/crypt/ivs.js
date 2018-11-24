// Packages
import { join } from "path"

// Helpers
export async function getIvs(options) {
  const { cwd, events, ivsPath, props } = options

  await events.fsReadJson([...props, "encrypt", "ivs"], {
    ensure: true,
    json: {},
    path: join(cwd, ivsPath),
    save: true,
  })
}

export async function writeIvs(options) {
  const { cwd, events, ivs, ivsPath, props } = options

  for (const iv in ivs) {
    ivs[iv] = ivs[iv].toString("hex")
  }

  await events.fsWriteJson([...props, "encrypt", "ivs"], {
    json: ivs,
    path: join(cwd, ivsPath),
    save: true,
  })
}
