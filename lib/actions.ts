"use server"

import { streamObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { createStreamableValue } from "@ai-sdk/rsc"
import { z } from "zod"

export async function generate(input: string) {
  "use server"

  const stream = createStreamableValue()
  ;(async () => {
    const { partialObjectStream } = await streamObject({
      model: openai("gpt-4o"),
      system:
        "You generate five notifications for a social media app. Each notification should have a unique fictional person's name.",
      prompt: input,
      schema: z.object({
        notifications: z.array(
          z.object({
            name: z.string().describe("Name of a fictional person."),
            message: z.string().describe("The notification message. Do not use emojis or links."),
            minutesAgo: z.number().describe("A random number between 1 and 60."),
          }),
        ),
      }),
    })

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject)
    }

    stream.done()
  })()

  return { object: stream.value }
}
