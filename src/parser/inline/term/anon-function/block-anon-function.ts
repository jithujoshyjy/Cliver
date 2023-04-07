import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, isBlockedType } from "../../../utility.js"
import { generateTypeExpression } from "../../type/type-expression.js"
import { generateKeyword } from "../../keyword.js"
import { generateParamList } from "../param-list.js"
import { generateBlock } from "../../../block/block.js"
import { generateInline } from "../../inline.js"
import { generateKindList } from "../kind-list.js"

export function generateBlockAnonFunction(context: string[], tokens: TokenStream): BlockAnonFunction | MismatchToken {
	const blockAnonFunction: BlockAnonFunction = {
		type: "BlockAnonFunction",
		body: [],
		kinds: null!,
		parameters: null!,
		signature: null,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const maybeKeyword = generateKeyword(["BlockAnonFunction", ...context], tokens)

	if (!isKeyword(maybeKeyword, "fun")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	blockAnonFunction.start = maybeKeyword.start
	blockAnonFunction.line = maybeKeyword.line
	blockAnonFunction.column = maybeKeyword.column

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	if (isOperator(currentToken, "<")) {
		const defaultReturnKindId: Identifier = {
			type: "Identifier",
			name: "return",
			line: currentToken.line,
			column: -1,
			start: -1,
			end: -1
		}

		const kindList: KindList
			| MismatchToken = generateKindList(["BlockAnonFunction", ...context], tokens)

		if (kindList.type == "MismatchToken") {
			const defaultKindList: KindList = {
				type: "KindList",
				kinds: [defaultReturnKindId],
				line: currentToken.line,
				column: -1,
				start: -1,
				end: -1
			}

			blockAnonFunction.kinds = defaultKindList
			tokens.cursor = initialCursor
			return kindList
		}

		kindList.kinds.unshift(defaultReturnKindId)
		blockAnonFunction.kinds = kindList

		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken
	}

	const paramList = generateParamList(["BlockAnonFunction", ...context], tokens)
	if (paramList.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return paramList
	}

	blockAnonFunction.parameters = paramList
	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	if (isOperator(currentToken, "::")) {
		currentToken = skip(tokens, skipables) // skip ::
		const typeExpression = generateTypeExpression(["BlockAnonFunction", ...context], tokens)

		if (typeExpression.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return typeExpression
		}

		blockAnonFunction.signature = typeExpression
	}

	const nodeGenerators = [
		generateBlock, generateInline
	]

	while (currentToken.type != "EOF") {

		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		const resetCursorPoint = tokens.cursor
		const endKeyword = generateKeyword(["BlockAnonFunction", ...context], tokens)

		if (isKeyword(endKeyword, "end")) {
			blockAnonFunction.end = endKeyword.end
			break
		}

		let node: Block
			| Inline
			| MismatchToken = null!

		tokens.cursor = resetCursorPoint
		for (const nodeGenerator of nodeGenerators) {

			if (isBlockedType(nodeGenerator.name.replace("generate", "")))
				continue

			node = nodeGenerator(["BlockAnonFunction", ...context], tokens)
			currentToken = tokens.currentToken

			if (node.type != "MismatchToken")
				break

			if (node.errorDescription.severity <= 3) {
				tokens.cursor = initialCursor
				return node
			}
		}

		if (node.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return node
		}

		blockAnonFunction.body.push(node)
	}

	return blockAnonFunction
}