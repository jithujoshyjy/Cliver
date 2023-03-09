import { TokenStream } from "../../../../lexer/token.js"
import { NodePrinter, pickPrinter, _skipables, skip, isBlockedType, withBlocked, createMismatchToken, lookAheadForFunctionCall } from "../../../utility.js"
import { printExpression } from "../../expression/expression.js"
import { generateGroupExpression, printGroupExpression } from "../../expression/group-expression.js"
import { generateIdentifier, printIdentifier } from "../../literal/identifier.js"
import { generateFunctionCall, printFunctionCall } from "../function-call.js"
import { printPair } from "../pair.js"
import { generatePropertyAccess, printPropertyAccess } from "../property-access.js"
import { generateTaggedSymbol, printTaggedSymbol } from "../tagged-symbol.js"
import { generateInlineFStringFragment, printInlineFStringFragment } from "./inline-f-string.js"
import { generateMultilineFString, printMultilineFString } from "./multiline-f-string.js"

export function generateTaggedString(context: string[], tokens: TokenStream): TaggedString | MismatchToken {
	const taggedString: TaggedString = {
		type: "TaggedString",
		tag: null!,
		value: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0,
		meta: {}
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const nodeGenerators = [
		generateTaggedSymbol, generateFunctionCall, generatePropertyAccess, generateIdentifier, generateGroupExpression
	]

	let tag: Identifier
        | PropertyAccess
        | FunctionCall
        | GroupExpression
        | TaggedString
        | TaggedSymbol
        | MismatchToken = null!

	for (const nodeGenerator of nodeGenerators) {

		if (isBlockedType(nodeGenerator.name.replace("generate", "")))
			continue

		tag = withBlocked(["TaggedString"], () => nodeGenerator(["TaggedString", ...context], tokens))
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

	taggedString.start = tag.start
	taggedString.line = tag.line
	taggedString.column = tag.column
	taggedString.tag = tag

	currentToken = _skipables.includes(tokens.currentToken)
		? skip(tokens, _skipables)
		: tokens.currentToken

	let taggedStr: InlineFStringFragment
        | MultilineFString
        | MismatchToken = generateMultilineFString(["TaggedString", ...context], tokens)

	if (taggedStr.type == "MismatchToken")
		taggedStr = generateInlineFStringFragment(["TaggedString", ...context], tokens)

	if (taggedStr.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return taggedStr
	}

	taggedString.value = taggedStr
	taggedString.end = taggedStr.end

	const isFunctionCallAhead = lookAheadForFunctionCall(tokens)
	if (isFunctionCallAhead && context[0] != "FunctionCall") {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	return taggedString
}

export function printInStringExpr(token: InStringExpr, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "

	const space = " ".repeat(4)
	return "InStringExpr" +
        "\n" + space.repeat(indent) +
        (!!token.positional.length && !!token.keyword.length ? middleJoiner : endJoiner) +

        (token.positional.length ? "positional\n" +
            token.positional.reduce((a, c, i, arr) => a + space.repeat(indent + 1) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                printExpression(c, indent + 2) + "\n", "") : "") +

        (token.keyword.length ? (token.positional.length ? space.repeat(indent + 1) + endJoiner : "") + "keyword\n" +
            token.keyword.reduce((a, c, i, arr) => a + space.repeat(indent + 2) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                printPair(c, indent + 3) + "\n", "") : "")
}

export function printInStringId(token: InStringId, indent = 0) {
	return printIdentifier(token.value, indent)
}

export function printTaggedString(token: TaggedString, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "

	const tagPrinters = [
		printIdentifier, printPropertyAccess, printFunctionCall, printGroupExpression,
		printTaggedString, printTaggedSymbol
	] as NodePrinter[]

	const fStringPrinters = [
		printInlineFStringFragment, printMultilineFString
	] as NodePrinter[]

	const tagPrinter = pickPrinter(tagPrinters, token.tag)!
	const fStringPrinter = pickPrinter(fStringPrinters, token.value)!
	const space = " ".repeat(4)
	return "TaggedString" +
        "\n" + space.repeat(indent) + middleJoiner + "tag" +
        "\n" + space.repeat(indent + 1) + endJoiner + tagPrinter(token.tag, indent + 1) +
        "\n" + space.repeat(indent) + endJoiner + fStringPrinter(token.value, indent + 1)
}