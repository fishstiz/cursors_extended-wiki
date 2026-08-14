async function getAndLogError(res: Response): Promise<Error> {
  const message = await res
    .json()
    .then(JSON.stringify)
    .catch(() => `${res.status} - ${res.statusText}`)

  console.error(message)
  return new Error(message)
}

export async function req(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'User-Agent': `Cursors Extended Wiki-${import.meta.env.DEV ? 'DEV' : 'PROD'}`,
      ...init?.headers
    }
  })

  if (!res.ok) {
    throw await getAndLogError(res)
  }

  return res
}

export async function reqJson(url: string, init?: RequestInit): Promise<unknown> {
  return (await req(url, init)).json()
}

export async function proxy(url: string, init?: RequestInit): Promise<Response> {
  const proxyUrl = import.meta.env.DEV ? 'http://127.0.0.1:8787' : 'https://fzproxy.fishstiz.workers.dev'

  return req(`${proxyUrl}?url=${url}`, init)
}
