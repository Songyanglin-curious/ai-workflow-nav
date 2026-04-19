export async function simulateRequest<T>(payload: T, delay = 120): Promise<T> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, delay)
  })

  return payload
}
