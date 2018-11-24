// Helpers
export async function glob(options) {
  const { cwd, events, glob, props } = options

  await events.glob([...props, "encrypt", "glob"], {
    cwd,
    pattern: glob,
    save: true,
  })
}
