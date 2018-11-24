import { join } from "path"

export async function move({ cwd, events, path, props }) {
  return await events.fsMove(props, {
    dest: join(cwd, path),
    overwrite: true,
    src: join(cwd, `${path}.enc`),
  })
}
