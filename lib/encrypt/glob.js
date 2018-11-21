// Helpers
export async function glob(options) {
  const { cwd, events, glob, ns } = options

  await events.glob([...ns, "encrypt", "glob"], {
    action: "storeGlob",
    cwd,
    pattern: glob,
  })
}
