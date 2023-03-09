import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node, NodePrinter, pickPrinter, PartialParse, isOperator, isPunctuator, skipables, lookAheadForFunctionCall, lookAheadForPropertyAccess, lookAheadForSymbolLiteral, lookAheadForStringLiteral, isBlockedType, withBlocked } from "../../utility.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier, printIdentifier } from "../literal/identifier.js"
import { generateSymbolLiteral, printSymbolLiteral } from "../literal/symbol-literal.js"
import { generateFunctionCall, printFunctionCall } from "./function-call.js"
import { generatePropertyAccess, printPropertyAccess } from "./property-access.js"
import { generateTaggedString, printTaggedString } from "./tagged-string/tagged-string.js"

export function generateTaggedSymbol(context: string[], tokens: TokenStream): TaggedSymbol | MismatchToken {
	const taggedSymbol: TaggedSymbol = {
		type: "TaggedSymbol",
		fragments: [],
		tag: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0,
		meta: {}
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const partialParsables = [
		"FunctionCall", "PropertyAccess",
		"TaggedSymbol", "TaggedString"
	]

	const nodeGenerators = [
		generateTaggedString, generateFunctionCall, generatePropertyAccess, generateIdentifier, generateGroupExpression
	]

	let tag: Identifier
        | PropertyAccess
        | FunctionCall
        | GroupExpression
        | TaggedSymbol
        | TaggedString
        | MismatchToken = null!

	for (const nodeGenerator of nodeGenerators) {
		if (isBlockedType(nodeGenerator.name.replace("generate", "")))
			continue

		tag = withBlocked(["TaggedSymbol"], () => nodeGenerator(["TaggedSymbol", ...context], tokens))
		currentToken = tokens.currentToken

		if (tag.type != "MismatchToken")
			break

		if (tag.errorDescription.severity <= 3) {
			tokens.cursor = initialCursor
			return tag
		}
	}

	if (tag.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return tag
	}

	taggedSymbol.start = tag.start
	taggedSymbol.line = tag.line
	taggedSymbol.column = tag.column
	taggedSymbol.tag = tag

	while (!tokens.isFinished) {

		currentToken = _skipables.includes(tokens.currentToken)
			? skip(tokens, _skipables)
			: tokens.currentToken

		const fragment = generateSymbolLiteral(["TaggedSymbol", ...context], tokens)

		if (fragment.type == "MismatchToken" && taggedSymbol.fragments.length == 0) {
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken)
		}

		if (fragment.type == "MismatchToken")
			break

		taggedSymbol.end = fragment.end
		taggedSymbol.fragments.push(fragment)
	}

	if (taggedSymbol.fragments.length < 1) {
		tokens.cursor = initialCursor
		return createMismatchToken(tokens.currentToken)
	}

	return taggedSymbol
}

export function printTaggedSymbol(token: TaggedSymbol, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const printers = [
		printIdentifier, printPropertyAccess, printFunctionCall, printGroupExpression,
		printTaggedString, printTaggedSymbol
	] as NodePrinter[]

	const printer = pickPrinter(printers, token.tag)!
	const space = " ".repeat(4)
	return "TaggedSymbol" +
        "\n" + space.repeat(indent) + middleJoiner + "tag" +
        "\n" + space.repeat(indent + 1) + endJoiner + printer(token.tag, indent + 2) +
        (token.fragments.length
        	? "\n" + space.repeat(indent) + endJoiner +
            "fragments" +
            token.fragments.reduce((a, c, i, arr) =>
            	a + "\n" + space.repeat(indent + 1) +
                (i < arr.length - 1 ? middleJoiner : endJoiner) + printSymbolLiteral(c, indent + 2), "")
        	: "")
}