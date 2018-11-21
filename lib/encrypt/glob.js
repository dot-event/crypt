// Packages
import { join } from "path"

// Helpers
export async function glob(options) {
  const { cwd, events, glob, ns } = options

  await events.glob([...ns, "encrypt", "glob"], {
    action: "storeGlob",
    pattern: join(cwd, glob),
  })
}
