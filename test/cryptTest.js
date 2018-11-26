// Packages
import dotEvent from "dot-event"
import dotTask from "@dot-event/task"

// Helpers
import dotCrypt from "../"

// Variables
let events

// Tests
beforeEach(async () => {
  events = dotEvent()

  dotCrypt({ events })
  dotTask({ events })

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
