import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import encrypt from "../dist/encrypt"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  encrypt({ events, store })
  dotTask({ events, store })

  await Promise.all([
    events.fs({
      action: "remove",
      path: `${__dirname}/fixture/key.json`,
    }),
    events.fs({
      action: "remove",
      path: `${__dirname}/fixture/ivs.json`,
    }),
    events.fs({
      action: "writeFile",
      body: "hello",
      path: `${__dirname}/fixture/file.txt`,
    }),
  ])
})

async function run(...argv) {
  await events.task({
    argv,
    op: "encrypt",
    path: `${__dirname}/fixture`,
  })
}

test("encrypt/decrypt", async () => {
  await run("--password", "test")
  await run("-a", "decrypt")
})
