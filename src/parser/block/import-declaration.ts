import { TokenStream } from "../../lexer/token.js"
import { generateAsExpression } from "../inline/expression/as-expression.js"
import { generateNonVerbalOperator } from "../inline/expression/operation.ts/non-verbal-operator.js"
import { generatePrefixOperation } from "../inline/expression/operation.ts/prefix-operation.js"
import { generateKeyword } from "../inline/keyword.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateStringLiteral } from "../inline/literal/string-literal.js"
import { generateTaggedSymbol } from "../inline/term/tagged-symbol.js"
import { createMismatchToken, isBlockedType, isKeyword, isPunctuator, skip, skipables, _skipables } from "../utility.js"

export function generateImportDeclaration(context: string[], tokens: TokenStream): ImportDeclaration | MismatchToken {
	const importDeclr: ImportDeclaration = {
		type: "ImportDeclaration",
		specifiers: [],
		sources: [],
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken

	const importKeyword = generateKeyword(["ImportDeclaration", ...context], tokens)
	if (importKeyword.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return importKeyword
	}

	if (!isKeyword(importKeyword, "import")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	importDeclr.start = importKeyword.start
	importDeclr.line = importKeyword.line
	importDeclr.column = importKeyword.column

	const captureComma = () => {
		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		if (!isPunctuator(currentToken, ",")) {
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken)
		}

		return currentToken
	}

	const captureSpecifier = () => {
		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		const specifierGenerators = [
			generateAsExpression,
			generateIdentifier, generatePrefixOperation, generateNonVerbalOperator
		]

		let specifier: AsExpression
            | Identifier
            | PrefixOperation
            | NonVerbalOperator
            | MismatchToken = null!

		for (const specifierGenerator of specifierGenerators) {
			if (isBlockedType(specifierGenerator.name.replace("generate", "")))
				continue
            
			specifier = specifierGenerator(["ImportDeclaration", ...context], tokens)
			if (specifier.type != "MismatchToken")
				break
		}

		return specifier
	}

	while (!tokens.isFinished) {
		const specifier = captureSpecifier()

		if (specifier.type == "MismatchToken")
			break

		importDeclr.specifiers.push(specifier)
		if (["PrefixOperation", "NonVerbalOperator"].includes(specifier.type))
			break
		const comma = captureComma()

		if (comma.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return comma
		}
	}

	const parseSource = () => {
		let source: MismatchToken
            | TaggedSymbol
            | StringLiteral = generateTaggedSymbol(["ImportDeclaration", ...context], tokens)

		if (source.type == "MismatchToken") {
			source = generateStringLiteral(["ImportDeclaration", ...context], tokens)
		}

		if (source.type == "StringLiteral" && source.kind != "inline") {
			tokens.cursor = initialCursor
			return createMismatchToken(tokens.currentToken)
		}

		return source
	}

	const parseSources = () => {
		const sources: Array<TaggedSymbol | StringLiteral> = []
		while (!tokens.isFinished) {
			const source = parseSource()

			if (source.type == "MismatchToken") {
				tokens.cursor = initialCursor
				return source
			}

			sources.push(source)

			const comma = captureComma()

			if (comma.type == "MismatchToken") {
				break
			}
			currentToken = skip(tokens, skipables)
		}
		return sources
	}

	if (importDeclr.specifiers.length === 0) {
		const sources = parseSources()
		if (!Array.isArray(sources)) {
			tokens.cursor = initialCursor
			return sources
		}

		importDeclr.sources = sources
	}
	else {
		currentToken = skip(tokens, skipables) // from

		if (!isKeyword(currentToken, "from") && importDeclr.specifiers.every(x => x.type == "Identifier")) {
			importDeclr.sources = importDeclr.specifiers as Identifier[]
			importDeclr.specifiers = []
		}

		currentToken = skip(tokens, skipables) // skip from

		const sources = parseSources()
		if (!Array.isArray(sources)) {
			tokens.cursor = initialCursor
			return sources
		}

		importDeclr.sources = sources
	}

	return importDeclr
}

export function printImportDeclaration(token: ImportDeclaration, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "ImportDeclaration\n"
}