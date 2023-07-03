import { TokenStream } from "../../lexer/token.js"
import { generatePattern } from "../inline/expression/pattern/pattern.js"
import { generateInline } from "../inline/inline.js"
import { generateKeyword } from "../inline/keyword.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateStringLiteral } from "../inline/literal/string-literal.js"
import { createMismatchToken, isKeyword, skip, skipables, _skipables, isPunctuator, generateOneOf, PartialParse, DiagnosticMessage } from "../utility.js"
import { generateBlock } from "./block.js"

export function generateDoCatchBlock(context: string[], tokens: TokenStream): DoCatchBlock | MismatchToken {
	const doCatchBlock: DoCatchBlock = {
		type: "DoCatchBlock",
		body: [],
		handlers: [],
		done: null,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const doKeyword = generateKeyword(["DoCatchBlock", ...context], tokens)

	if (doKeyword.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return doKeyword
	}

	if (!isKeyword(doKeyword, "do")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	doCatchBlock.start = doKeyword.start
	doCatchBlock.line = doKeyword.line
	doCatchBlock.column = doKeyword.column

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	const nodeGenerators = [generateBlock, generateInline]
	const doBlockBody = captureBody(doCatchBlock)

	if (!Array.isArray(doBlockBody)) {
		tokens.cursor = initialCursor
		return doBlockBody
	}

	doCatchBlock.body = doBlockBody

	const captureComma = () => {
		const initialToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		if (!isPunctuator(initialToken, ",")) {
			return createMismatchToken(initialToken)
		}

		currentToken = skip(tokens, skipables)
		return initialToken
	}

	while (!tokens.isFinished) {

		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		const maybeKeyword = generateKeyword(["DoCatchBlock", ...context], tokens)

		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		if (maybeKeyword.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return maybeKeyword
		}

		if (isKeyword(maybeKeyword, "end")) {
			doCatchBlock.end = maybeKeyword.end
			break
		}

		if (doCatchBlock.done != null) {
			const error: DiagnosticMessage = "Multiple done blocks within {0} on {1}:{2}"
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken, [error, doCatchBlock.type, currentToken.line, currentToken.column])
		}

		if (isKeyword(maybeKeyword, "done")) {

			const doneBlock: DoneBlock = {
				type: "DoneBlock",
				body: [],
				status: null!,
				line: maybeKeyword.line,
				column: maybeKeyword.column,
				start: maybeKeyword.start,
				end: maybeKeyword.end
			}

			const nodeGenerators = [generateIdentifier, generateStringLiteral]
			const doneStatus: Identifier
				| StringLiteral
				| MismatchToken = generateOneOf(tokens, ["DoCatchBlock", ...context], nodeGenerators)

			if (doneStatus.type == "MismatchToken") {
				tokens.cursor = initialCursor
				return doneStatus
			}

			doneBlock.status = doneStatus
			const doneBlockBody = captureBody(doneBlock)

			if (!Array.isArray(doneBlockBody)) {
				tokens.cursor = initialCursor
				return doneBlockBody
			}

			doneBlock.body = doneBlockBody
			doneBlock.end = doneBlockBody.at(-1)?.end ?? doneBlock.end

			doCatchBlock.done = doneBlock
			continue
		}

		if (!isKeyword(maybeKeyword, "catch")) {
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken)
		}

		const catchBlock: CatchBlock = {
			type: "CatchBlock",
			body: [],
			params: [],
			line: maybeKeyword.line,
			column: maybeKeyword.column,
			start: maybeKeyword.start,
			end: maybeKeyword.end
		}

		const catchParams = captureCatchParams()
		if (!Array.isArray(catchParams)) {
			tokens.cursor = initialCursor
			return catchParams
		}

		catchBlock.params = catchParams
		const catchBlockBody = captureBody(catchBlock)

		if (!Array.isArray(catchBlockBody)) {
			tokens.cursor = initialCursor
			return catchBlockBody
		}

		catchBlock.body = catchBlockBody
		catchBlock.end = catchBlockBody.at(-1)?.end ?? catchBlock.end

		doCatchBlock.handlers.push(catchBlock)
	}

	if (doCatchBlock.done == null && doCatchBlock.handlers.length == 0) {
		const partialParse: PartialParse = {
			cursor: tokens.cursor,
			result: doCatchBlock
		}
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	return doCatchBlock

	function captureCatchParams() {
		currentToken = _skipables.includes(tokens.currentToken)
			? skip(tokens, _skipables)
			: tokens.currentToken

		let lastDelim: LexicalToken | MismatchToken | null = null, isInitial = true
		const catchParams: Pattern[] = []

		while (!tokens.isFinished) {
			if (!isInitial && lastDelim?.type == "MismatchToken")
				break

			currentToken = skipables.includes(tokens.currentToken)
				? skip(tokens, skipables)
				: tokens.currentToken

			const catchParam = generatePattern(["DoCatchBlock", ...context], tokens)
			lastDelim = catchParam.type == "MismatchToken" ? lastDelim : null

			if (catchParam.type == "MismatchToken") {
				tokens.cursor = initialCursor
				return catchParam
			}

			catchParams.push(catchParam)
			lastDelim = captureComma()
			isInitial = false
		}

		return catchParams
	}

	function captureBody(blockHolder: DoCatchBlock | CatchBlock | DoneBlock) {
		const blockHolderBody: Array<Block | Inline> = []
		while (!tokens.isFinished) {

			currentToken = skipables.includes(tokens.currentToken)
				? skip(tokens, skipables)
				: tokens.currentToken

			const resetCursorPoint = tokens.cursor
			const maybeKeyword = generateKeyword(["DoCatchBlock", ...context], tokens)

			tokens.cursor = resetCursorPoint
			if (["catch", "done", "end"].some(x => isKeyword(maybeKeyword, x as KeywordKind))) {
				if (isKeyword(maybeKeyword, "end"))
					blockHolder.end = maybeKeyword.end
				break
			}

			const bodyItem: Block
				| Inline
				| MismatchToken = generateOneOf(tokens, ["DoCatchBlock", ...context], nodeGenerators)

			if (bodyItem.type == "MismatchToken") {
				tokens.cursor = initialCursor
				return bodyItem
			}

			blockHolderBody.push(bodyItem)
		}
		return blockHolderBody
	}
}

/* const parseCatchParams = (catchBlock: CatchBlock) => {

		const capturePattern = () => {
			currentToken = skipables.includes(tokens.currentToken)
				? skip(tokens, skipables)
				: tokens.currentToken

			const pattern = generatePattern(["CatchBlock", ...context], tokens)
			return pattern
		}

		const captureComma = () => {
			currentToken = skipables.includes(tokens.currentToken)
				? skip(tokens, skipables)
				: tokens.currentToken

			if (!isPunctuator(currentToken, ","))
				return createMismatchToken(currentToken)

			tokens.advance()
			return currentToken
		}

		const firstPattern = capturePattern()
		if (firstPattern.type == "MismatchToken")
			return firstPattern

		catchBlock.params.push(firstPattern)
		while (!tokens.isFinished) {
			const comma = captureComma()
			if (comma.type == "MismatchToken")
				break

			const pattern = capturePattern()
			if (pattern.type == "MismatchToken")
				return pattern

			catchBlock.params.push(pattern)
			currentToken = tokens.currentToken
		}

		return catchBlock
	}

	const parseDoneParam = () => {
		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		let status: Identifier
			| StringLiteral
			| MismatchToken = generateOneOf(tokens, ["DoneBlock", ...context], [generateIdentifier, generateStringLiteral])

		return status
	}

	const nodeGenerators = [
		generateBlock, generateInline
	]

	let blockHolder: DoCatchBlock
		| CatchBlock
		| DoneBlock = doCatchBlock

	let blockHolderBody = doCatchBlock.body
	let isSingleItemBlock = false

	while (currentToken.type != "EOF") {

		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		const resetCursorPoint = tokens.cursor
		const maybeKeyword = generateKeyword(["DoCatchBlock", ...context], tokens)
		if (isKeyword(maybeKeyword, "catch")) {

			if (doCatchBlock.done !== null) {
				tokens.cursor = initialCursor
				const error: DiagnosticMessage = "Unexpected {0} block on {1}:{2}"
				return createMismatchToken(tokens.currentToken, [error, "catch", maybeKeyword.line, maybeKeyword.column])
			}

			const catchBlock: CatchBlock = {
				type: "CatchBlock",
				body: [],
				params: [],
				line: maybeKeyword.line,
				column: maybeKeyword.column,
				start: maybeKeyword.start,
				end: 0
			}

			blockHolder = catchBlock
			blockHolderBody = catchBlock.body
			doCatchBlock.handlers.push(catchBlock)

			const maybeCatch = parseCatchParams(catchBlock)
			if (maybeCatch.type == "MismatchToken") {
				tokens.cursor = initialCursor
				return maybeCatch
			}

			currentToken = skipables.includes(tokens.currentToken)
				? skip(tokens, skipables)
				: tokens.currentToken

			if (isOperator(currentToken, ":")) {
				currentToken = skip(tokens, skipables)
				isSingleItemBlock = true
			}
		}
		else if (isKeyword(maybeKeyword, "done")) {

			if (doCatchBlock.done !== null) {
				tokens.cursor = initialCursor
				const error: DiagnosticMessage = "Unexpected {0} block on {1}:{2}"
				return createMismatchToken(tokens.currentToken, [error, "done", maybeKeyword.line, maybeKeyword.column])
			}

			const doneBlock: DoneBlock = {
				type: "DoneBlock",
				body: [],
				status: null!,
				line: maybeKeyword.line,
				column: maybeKeyword.column,
				start: maybeKeyword.start,
				end: 0
			}

			const doneBlockParam = parseDoneParam()
			if (doneBlockParam.type == "MismatchToken") {
				tokens.cursor = initialCursor
				return doneBlockParam
			}

			doneBlock.status = doneBlockParam
			blockHolder = doneBlock
			blockHolderBody = doneBlock.body
			doCatchBlock.done = doneBlock

			currentToken = skipables.includes(tokens.currentToken)
				? skip(tokens, skipables)
				: tokens.currentToken

			if (isOperator(currentToken, ":")) {
				currentToken = skip(tokens, skipables)
				isSingleItemBlock = true
			}
		}
		else if (isKeyword(maybeKeyword, "end")) {
			doCatchBlock.end = blockHolder.end = maybeKeyword.end
			break
		}

		let node: Block
			| Inline
			| MismatchToken = null!

		tokens.cursor = resetCursorPoint
		for (const nodeGenerator of nodeGenerators) {

			if (isBlockedType(nodeGenerator.name.replace("generate", "")))
				continue

			node = nodeGenerator(["DoCatchBlock", ...context], tokens)
			currentToken = tokens.currentToken
			if (node.type != "MismatchToken")
				break

			if (node.errorDescription.severity <= 3) {
				tokens.cursor = initialCursor
				return node
			}
		}

		currentToken = tokens.currentToken
		if (node.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return node
		}

		blockHolder.end = node.end
		blockHolderBody.push(node)

		if (isSingleItemBlock)
			break
	}

	if (doCatchBlock.body.length == 0) {
		const error: DiagnosticMessage = "Empty DoExpression on {0}:{1}"
		tokens.cursor = initialCursor
		return createMismatchToken(tokens.currentToken, [error, doCatchBlock.line, doCatchBlock.column])
	}

	if (doCatchBlock.handlers.length == 0 && doCatchBlock.done == null) {
		const partialParse: PartialParse = {
			cursor: tokens.cursor,
			result: doCatchBlock
		}
		tokens.cursor = initialCursor
		return createMismatchToken(tokens.currentToken, partialParse)
	} */

export function printDoCatchBlock(token: DoCatchBlock, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "DoCatchBlock"
}