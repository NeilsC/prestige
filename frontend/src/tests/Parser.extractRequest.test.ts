import { extractRequest } from "../scripts/Parser"
import Context from "_/Context"

jest.mock("_/Context")
jest.mock("_/Workspace")

console.log = jest.fn()

function makeMockContext() {
	return new Context(null, null, null, {})
}

test("single line input with one request", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"GET http://httpbun.com",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("GET")
	expect(request.url).toBe("http://httpbun.com")
})

test("get request on first and only non-blank line", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"GET http://httpbun.com",
		"",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("GET")
	expect(request.url).toBe("http://httpbun.com")
})

test("get request with blank lines around", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"",
		"GET http://httpbun.com",
		"",
	], 1, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("GET")
	expect(request.url).toBe("http://httpbun.com")
})

test("get request with one query param", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"GET http://httpbun.com/get",
		"  name=sherlock",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("GET")
	expect(request.url).toBe("http://httpbun.com/get?name=sherlock")
})

test("get request with query param with special characters", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"GET http://httpbun.com/get",
		"  crazy=this crazy?stuff&with=a bang!",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("GET")
	expect(request.url).toBe("http://httpbun.com/get?crazy=this%20crazy%3Fstuff%26with%3Da%20bang!")
})

test("get request with multiple query params", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"GET http://httpbun.com/get",
		"  first=sherlock",
		"  last=holmes",
		"  brother=mycroft",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("GET")
	expect(request.url).toBe("http://httpbun.com/get?first=sherlock&last=holmes&brother=mycroft")
})

test("get request with headers and multiple query params", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"GET http://httpbun.com/get",
		"  first=sherlock",
		"  last=holmes",
		"  brother=mycroft",
		"X-One: value one",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("GET")
	expect(Array.from(request.headers)).toEqual([
		["x-one", "value one"],
	])
	expect(request.url).toBe("http://httpbun.com/get?first=sherlock&last=holmes&brother=mycroft")
})

test("post request with one line body", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"POST http://httpbun.com",
		"",
		"body goes here",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("POST")
	expect(request.url).toBe("http://httpbun.com")
	expect(request.body).toBe("body goes here")
})

test("get request with an ending", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"POST http://httpbun.com",
		"",
		"body goes here",
		"",
		"###",
		"more useless stuff here",
		"",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("POST")
	expect(request.url).toBe("http://httpbun.com")
	expect(request.body).toBe("body goes here")
})

test("pokemon graphql", async () => {
	const context = makeMockContext()

	const queryText = "query {\n" +
		"  pokemon(name: \"Pikachu\") {\n" +
		"    id\n" +
		"    number\n" +
		"    name\n" +
		"    attacks {\n" +
		"      special {\n" +
		"        name\n" +
		"        type\n" +
		"        damage\n" +
		"      }\n" +
		"      fast {\n" +
		"        name\n" +
		"        type\n" +
		"        damage\n" +
		"      }\n" +
		"    }\n" +
		"    evolutions {\n" +
		"      id\n" +
		"      number\n" +
		"      name\n" +
		"      attacks {\n" +
		"        fast {\n" +
		"          name\n" +
		"          type\n" +
		"          damage\n" +
		"        }\n" +
		"      }\n" +
		"    }\n" +
		"  }\n" +
		"}"

	const request = await extractRequest([
		"POST https://graphql-pokemon.now.sh/",
		"Content-Type: application/graphql",
		"",
		queryText,
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("POST")
	expect(request.url).toBe("https://graphql-pokemon.now.sh/")
	expect(Array.from(request.headers)).toEqual([["content-type", "application/graphql"]])
	expect(request.body).toBe(queryText)
})

test("slack post message", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"POST https://slack.com/api/chat.postMessage",
		"Content-Type: application/json; charset=UTF-8",
		"Authorization: Bearer token",
		"",
		"{\"channel\":\"#general\",\"text\":\"A message from the API!\"}",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("POST")
	expect(request.url).toBe("https://slack.com/api/chat.postMessage")
	expect(Array.from(request.headers)).toEqual([
		["authorization", "Bearer token"],
		["content-type", "application/json; charset=UTF-8"],
	])
	expect(request.body).toBe("{\"channel\":\"#general\",\"text\":\"A message from the API!\"}")
})

test("get request with single script", async () => {
	const context = makeMockContext()

	const request = await extractRequest([
		"### javascript",
		"",
		"###",
		"GET http://httpbun.com/get",
	], 3, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("GET")
	expect(request.url).toBe("http://httpbun.com/get")
})

test("run inside script should fail", async () => {
	const context = makeMockContext()

	await expect(
		extractRequest([
			"### javascript",
			"const n = 1;",
			"###",
			"GET http://httpbun.com/get",
		], 1, context),
	)
		.rejects
		.toThrow("Can't execute from inside a script block.")
})

test("extract request with empty header name", async () => {
	const context = makeMockContext()

	await expect(
		extractRequest([
			"GET http://httpbun.com/get",
			": value of empty header name",
		], 1, context),
	)
		.rejects
		.toThrow("Header name cannot be blank.")
})

test("multipart with await from file bucket", async () => {
	const context = makeMockContext();
	(context.multipart as jest.Mock).mockReturnValueOnce("multipart data")

	const request = await extractRequest([
		"POST https://httpbun.com/post",
		"",
		"= this.multipart({",
		"  file: await this.fileFromBucket('data.txt')",
		"})",
	], 0, context)

	expect(request).toBeDefined()
	expect(request.method).toBe("POST")
	expect(request.url).toBe("https://httpbun.com/post")
	expect(request.body).toBe("multipart data")
})
