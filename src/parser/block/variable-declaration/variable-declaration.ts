import { TokenStream } from "../../../lexer/token.js"
import { generateKeyword } from "../../inline/keyword.js"
import { generateTypeExpression } from "../../inline/type/type-expression.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, isKeyword, _skipables, DiagnosticMessage } from "../../utility.js"
import { generateVariableDeclarator } from "./variable-declarator.js"

export function generateVariableDeclaration(context: string[], tokens: TokenStream): VariableDeclaration | MismatchToken {
	const variableDeclaration: VariableDeclaration = {
		type: "VariableDeclaration",
		declarations: [],
		kind: "var",
		signature: null,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor
    
	const varOrValKeyword = generateKeyword(["VariableDeclaration", ...context], tokens)
	if (varOrValKeyword.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return varOrValKeyword
	}

	if (!["var", "val"].includes(varOrValKeyword.name)) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	variableDeclaration.start = varOrValKeyword.start
	variableDeclaration.line = varOrValKeyword.line
	variableDeclaration.column = varOrValKeyword.column
	variableDeclaration.kind = varOrValKeyword.name as "var" | "val"

	const captureSignature = () => {
		currentToken = skip(tokens, skipables) // skip ::
		const signature = generateTypeExpression(["VariableDeclaration", ...context], tokens)
		return signature
	}

	if (isOperator(currentToken, "::")) {
		const signature = captureSignature()
		if (signature.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return signature
		}

		variableDeclaration.signature = signature
		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken
	}

	const captureDeclarator = () => {
		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		const declarator = generateVariableDeclarator(["VariableDeclaration", ...context], tokens)

		currentToken = tokens.currentToken
		return declarator
	}

	const captureComma = () => {
		const resetCursorPoint = tokens.cursor
		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		if (!isPunctuator(currentToken, ",")) {
			tokens.cursor = resetCursorPoint
			return createMismatchToken(currentToken)
		}

		currentToken = skip(tokens, skipables)
		return currentToken
	}

	while (!tokens.isFinished) {
		const declarator = captureDeclarator()

		if (declarator.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return declarator
		}

		variableDeclaration.declarations.push(declarator)
		const comma = captureComma()

		currentToken = tokens.currentToken
		if (comma.type == "MismatchToken" || currentToken.type == "EOF")
			break
	}

	const captureDelimiter = () => {

		const { line, column } = currentToken
		currentToken = _skipables.includes(tokens.currentToken)
			? skip(tokens, _skipables)
			: tokens.currentToken

		let isDelimited = currentToken.type == "Newline"
		isDelimited ||= isPunctuator(currentToken, ";")

		const isExplicitDelimited = isDelimited
		isDelimited ||= currentToken.type == "EOF"

		const resetCursorPoint = tokens.cursor
		const maybeKeyword = generateKeyword(["VariableDeclaration", ...context], tokens)
		isDelimited ||= maybeKeyword.type == "Keyword" && isKeyword(maybeKeyword, "end")
		tokens.cursor = resetCursorPoint

		if (!isDelimited) {
			const error: DiagnosticMessage = "Expected {0} after {1}:{2}"
			return createMismatchToken(currentToken, [error, "'\\n' or ';'", line, column])
		}

		const prevToken = currentToken
		currentToken = isExplicitDelimited
			? skip(tokens, skipables)
			: tokens.currentToken

		return prevToken
	}

	const delimiter = captureDelimiter()
	if (delimiter.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return delimiter
	}

	variableDeclaration.end = delimiter.end
	return variableDeclaration
}

export function printVariableDeclaration(token: VariableDeclaration, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "VariableDeclaration" + "\n"
}