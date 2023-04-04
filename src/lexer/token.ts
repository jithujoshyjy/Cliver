export class TokenStream {
	#index = 0
	#length = 0
	input = ""
	#isFinished = false
	#tokens: LexicalToken[] = []

	constructor(input: string, tokens: LexicalToken[]) {

		this.#tokens = tokens
		this.input = input
        
		if (tokens.at(-1)?.type != "EOF") {
			const EOF: LexicalToken = {
				value: "EOF",
				type: "EOF",
				line: tokens.at(-1)?.line ?? 0,
				column: tokens.at(-1)?.column ?? 0,
				file: tokens.at(-1)?.file ?? "",
				start: tokens.at(-1)?.end ?? 0,
				end: tokens.at(-1)?.end ?? 0,
			}
			this.#tokens.push(EOF)
		}

		this.#length = this.#tokens.length
		if (tokens.length === 0)
			this.#isFinished = true
	}

	get length(): number {
		return this.#length
	}

	get currentToken(): LexicalToken {
		return this.#tokens[this.#index]
	}

	get nextToken(): LexicalToken | null {
		if (this.#index < this.#length - 1) {
			this.#index++
			return this.#tokens[this.#index]
		}
		this.#isFinished = true
		return null
	}

	set cursor(idx: number) {
		if (idx >= this.#length)
			throw new RangeError(`Index out of bound: must be less than ${this.#length}`)
		this.#index = idx
		this.#isFinished = idx >= this.#length - 1
	}

	get cursor() {
		return this.#index
	}

	advance(): boolean {
		if (this.#index < this.#length - 1) {
			this.#index++
			return true
		}
		this.#isFinished = true
		return false
	}

	peek(amount: number): LexicalToken | null {
		if (-amount > this.#index) {
			return null
		}
		if (this.#index < this.#length - amount) {
			return this.#tokens[this.#index + amount]
		}
		return null
	}

	get isFinished(): boolean {
		return this.#isFinished
	}

	*[Symbol.iterator]() {
		while (!this.isFinished) {
			yield this.currentToken
			this.advance()
		}
	}
}