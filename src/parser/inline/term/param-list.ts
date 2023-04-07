import { TokenStream } from "../../../lexer/token.js"
import { isPunctuator, createMismatchToken, skip, skipables, isBlockedType } from "../../utility.js"
import { generateAssignExpr } from "../expression/assign-expression.js"
import { generatePattern } from "../expression/pattern/pattern.js"
import { generateIdentifier } from "../literal/identifier.js"

export function generateParamList(context: string[], tokens: TokenStream): ParamList | MismatchToken {
	const paramList: ParamList = {
		type: "ParamList",
		positional: [],
		keyword: [],
		captured: [],
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	if (!isPunctuator(currentToken, "(")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	paramList.start = currentToken.start
	paramList.line = currentToken.line
	paramList.column = currentToken.column

	currentToken = skip(tokens, skipables)

	let lastDelim: LexicalToken | MismatchToken | null = null
	let isInitial = true, argType: "positional" | "keyword" | "captured" = "positional"

	const parseParam = <T extends typeof argType>(argType: T) => {
		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		let param: AssignExpr
			| Pattern
			| Identifier
			| MismatchToken = null!

		const positionalParamGenerators = [generateAssignExpr, generatePattern]
		const keywordParamGenerators = [generateAssignExpr]
		const captureParamGenerators = [generateIdentifier]

		const paramGenerators = argType == "positional"
			? positionalParamGenerators
			: argType == "keyword"
				? keywordParamGenerators
				: captureParamGenerators

		for (const paramGenerator of paramGenerators) {
			if (isBlockedType(paramGenerator.name.replace("generate", "")))
				continue
			param = paramGenerator(["UnitFunction", ...context], tokens)
			currentToken = tokens.currentToken

			if (param.type != "MismatchToken")
				break

			if (param.errorDescription.severity <= 3) {
				tokens.cursor = initialCursor
				return param
			}
		}

		lastDelim = null
		return param
	}

	const captureComma = () => {
		const initialToken = tokens.currentToken

		if (!isPunctuator(initialToken, ",")) {
			return createMismatchToken(initialToken)
		}

		currentToken = skip(tokens, skipables)
		return initialToken
	}

	let semicolonCount = 0
	const captureSemicolon = () => {
		const initialToken = tokens.currentToken

		if (!isPunctuator(initialToken, ";")) {
			return createMismatchToken(initialToken)
		}

		semicolonCount++
		currentToken = skip(tokens, skipables)
		return initialToken
	}

	while (!tokens.isFinished) {

		if (isPunctuator(currentToken, ")")) {
			paramList.end = currentToken.end
			tokens.advance()
			break
		}

		if (!isInitial && lastDelim == null) {
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken)
		}

		if (lastDelim?.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return lastDelim
		}

		const param = parseParam(argType)

		if (param.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return param
		}

		paramList[argType].push(param as any)

		currentToken = skipables.includes(currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		lastDelim = captureComma()

		if (lastDelim.type == "MismatchToken")
			lastDelim = captureSemicolon()

		if (lastDelim.type != "MismatchToken" && isPunctuator(lastDelim, ";")) {
			argType = "keyword"
			if (semicolonCount == 2) {
				argType = "captured"
			}
			else if (semicolonCount > 2) {
				tokens.cursor = initialCursor
				return createMismatchToken(currentToken)
			}
		}

		isInitial = false
	}

	return paramList
}

export function printParamList(token: ParamList, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"
	const space = " ".repeat(4)

	return "ParamList"
}