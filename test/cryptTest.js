import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import dotCrypt from "../dist/crypt"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  dotCrypt({ events, store })
  dotTask({ events, store })

  await Promise.all([
    events.fsRemove({
      path: `${__dirname}/fixture/key.json`,
    }),
    events.fsRemove({
      path: `${__dirname}/fixture/ivs.json`,
    }),
    events.fsWriteFile({
      body: "hello",
      path: `${__dirname}/fixture/file.txt`,
    }),
  ])
})

async function run(op, ...argv) {
  await events.task({
    argv,
    op,
    path: `${__dirname}/fixture`,
  })
}

test("encrypt/decrypt", async () => {
  await run("crypt", "--encrypt", "--password", "test")
  await run("crypt", "--decrypt")
})
