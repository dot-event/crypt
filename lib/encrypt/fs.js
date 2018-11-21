export async function move({ events, ns, path }) {
  return await events.fs(ns, {
    action: "move",
    dest: path,
    overwrite: true,
    src: `${path}.enc`,
  })
}
