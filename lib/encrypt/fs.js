import { join } from "path"

export async function move({ cwd, events, ns, path }) {
  return await events.fs(ns, {
    action: "move",
    dest: join(cwd, path),
    overwrite: true,
    src: join(cwd, `${path}.enc`),
  })
}
