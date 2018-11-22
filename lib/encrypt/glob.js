// Helpers
export async function glob(options) {
  const { cwd, events, glob, props } = options

  await events.glob([...props, "encrypt", "glob"], {
    action: "storeGlob",
    cwd,
    pattern: glob,
  })
}
