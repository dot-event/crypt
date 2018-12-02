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
})

async function run(op, ...argv) {
  await events.task({
    argv,
    op,
    path: `${__dirname}/fixture`,
  })
}

test("first run", async () => {
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

  await run("crypt", "--encrypt", "--password", "test")
  await run("crypt", "--decrypt")
})

test("second run", async () => {
  await run("crypt", "--encrypt")
  await run("crypt", "--decrypt")
})

test("third run", async () => {
  const path = `${__dirname}/fixture/file.txt`
  await Promise.all([events.fsRemove({ path })])

  await run("crypt", "--encrypt")
  await run("crypt", "--decrypt")

  const out = await events.fsReadFile({ path })

  expect(out.toString()).toMatch("hello")
})
