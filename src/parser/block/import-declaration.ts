import { TokenStream } from "../../lexer/token.js"
import { generateAsExpression } from "../inline/expression/as-expression.js"
import { generateNonVerbalOperator } from "../inline/expression/operation.ts/non-verbal-operator.js"
import { generatePrefixOperation } from "../inline/expression/operation.ts/prefix-operation.js"
import { generateKeyword } from "../inline/keyword.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateStringLiteral } from "../inline/literal/string-literal.js"
import { generateTaggedSymbol } from "../inline/term/tagged-symbol.js"
import { createMismatchToken, isBlockedType, isKeyword, isPunctuator, skip, skipables, _skipables, generateOneOf, withBlocked } from "../utility.js"

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

	const taggedSymbolGenerator = (context: string[], tokens: TokenStream) =>
		withBlocked(["TaggedSymbol", "PropertyAccess", "FunctionCall", "GroupExpression", "TaggedString"],
			() => generateTaggedSymbol(context, tokens))

	const specifierGenerators = [
		taggedSymbolGenerator, generateStringLiteral,
		generateAsExpression, generatePrefixOperation,
		generateNonVerbalOperator, generateIdentifier
	]

	const captureComma = () => {
		const initialToken = tokens.currentToken

		if (!isPunctuator(initialToken, ",")) {
			return createMismatchToken(initialToken)
		}

		currentToken = skip(tokens, skipables)
		return initialToken
	}

	let lastDelim: LexicalToken | MismatchToken | null = null

	const captureSpecifier = () => {
		let specifier: AsExpression
			| Identifier
			| PrefixOperation
			| NonVerbalOperator
			| StringLiteral
			| TaggedSymbol
			| MismatchToken = null!

		const currentToken = tokens.currentToken
		specifier = generateOneOf(tokens, ["ImportDeclaration", ...context], specifierGenerators)

		const isNotImportAllSpecifier = specifier.type == "NonVerbalOperator"
			&& specifier.name != "..."

		const isNotImportAllAsSpecifier = specifier.type == "PrefixOperation"
			&& (specifier.operand.type != "Literal"
				|| specifier.operand.type == "Literal"
				&& specifier.operand.value.type != "Identifier")

		if (isNotImportAllSpecifier || isNotImportAllAsSpecifier)
			specifier = createMismatchToken(currentToken)

		lastDelim = specifier.type == "MismatchToken" ? lastDelim : null
		return specifier
	}

	let isInitial = true
	while (!tokens.isFinished) {

		if (!isInitial && lastDelim?.type == "MismatchToken")
			break

		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		const specifier = captureSpecifier()

		if (specifier.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return specifier
		}

		if (["TaggedSymbol", "StringLiteral"].includes(specifier.type))
			break

		importDeclr.specifiers.push(specifier)
		if (["PrefixOperation", "NonVerbalOperator"].includes(specifier.type))
			break

		lastDelim = captureComma()
		isInitial = false
	}

	const sourceGenerators = [taggedSymbolGenerator, generateStringLiteral, generateIdentifier]
	const parseSource = () => {
		let source: MismatchToken
			| TaggedSymbol
			| StringLiteral = null!

		source = generateOneOf(tokens, ["ImportDeclaration", ...context], sourceGenerators)

		if (source.type == "StringLiteral" && source.kind != "inline")
			source = createMismatchToken(tokens.currentToken)

		return source
	}

	const parseSources = () => {
		const sources: Array<TaggedSymbol | StringLiteral | Identifier> = []

		let isInitial = true
		let lastDelim: LexicalToken | MismatchToken | null = null

		while (!tokens.isFinished) {

			if (!isInitial && lastDelim?.type == "MismatchToken")
				break

			currentToken = skipables.includes(tokens.currentToken)
				? skip(tokens, skipables)
				: tokens.currentToken

			const source = parseSource()

			if (source.type == "MismatchToken") {
				tokens.cursor = initialCursor
				return source
			}

			importDeclr.end = source.end
			sources.push(source)

			lastDelim = captureComma()
			isInitial = false
		}

		return sources
	}

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	const fromKeyword = generateKeyword(["ImportDeclaration", ...context], tokens)

	if (fromKeyword.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return fromKeyword
	}

	if (!isKeyword(fromKeyword, "from")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	const sources = parseSources()
	console.log(sources);
	
	if (!Array.isArray(sources)) {
		tokens.cursor = initialCursor
		return sources
	}

	importDeclr.sources = sources
	return importDeclr
}

export function printImportDeclaration(token: ImportDeclaration, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "ImportDeclaration\n"
}