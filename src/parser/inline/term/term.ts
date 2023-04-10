import { TokenStream } from "../../../lexer/token.js"
import { NodePrinter, pickPrinter, isBlockedType, generateOneOf, createMismatchToken, PartialParse } from "../../utility.js"
import { generateAnonFunction, printAnonFunction } from "./anon-function/anon-function.js"
import { generateUnitFunction, printUnitFunction } from "./unit-function.js"
import { generateExternalCallbackNotation, printExternalCallbackNotation } from "./external-callback-notation.js"
import { generateForInline, printForInline } from "./for-inline.js"
import { generateFunctionCall, generateTaggedTermFunctionCall, printFunctionCall, printTaggedTermFunctionCall } from "./function-call.js"
import { generateIfInline, printIfInline } from "./if-inline.js"
import { generateImplicitMultiplication, printImplicitMultiplication } from "./implicit-multiplication.js"
import { generateInlineMacroApplication, printInlineMacroApplication } from "./inline-macro-application.js"
import { generateInlineStringFragment, printInlineStringFragment } from "./inline-string-fragment.js"
import { generateMetaDataInterpolation, printMetaDataInterpolation } from "./meta-data-interpolation.js"
import { generatePropertyAccess, generateTaggedTermPropertyAccess, printPropertyAccess, printTaggedTermPropertyAccess } from "./property-access.js"
import { generateTaggedNumber, printTaggedNumber } from "./tagged-number.js"
import { generateTaggedString, printTaggedString } from "./tagged-string/tagged-string.js"
import { generateTaggedSymbol, printTaggedSymbol } from "./tagged-symbol.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { generateSymbolFragment, printSymbolFragment } from "./symbol-fragment.js"
import { generateMatchInline, printMatchInline } from "./match-inline.js"
import { generateDoExpr, printDoExpr } from "./do-expr.js"
import { generatePipelineNotation, printPipelineNotation } from "./pipeline-notation/pipeline-notation.js"
import { generateObjectCascadeNotation, printObjectCascadeNotation } from "./object-cascade-notation/object-cascade-notation.js"

export function generateTerm(context: string[], tokens: TokenStream): Term | MismatchToken {
	const term: Term = {
		type: "Term",
		value: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0,
	}

	const initialCursor = tokens.cursor

	const nodeGenerators = [
		generatePipelineNotation, generateObjectCascadeNotation,
		generateExternalCallbackNotation, generateAnonFunction, generateUnitFunction,
		generateMetaDataInterpolation, generateTaggedTermPropertyAccess, generateTaggedTermFunctionCall, generateTaggedSymbol, generateSymbolFragment, generateTaggedString, generateInlineStringFragment, generateImplicitMultiplication, generateTaggedNumber, generateForInline,
		generateMatchInline, generateIfInline, generateDoExpr, generateInlineMacroApplication, generateEitherPropertyAccessOrFunctionCall, generateGroupExpression,
	]

	let node: typeof term.value | MismatchToken = null!
	for (const nodeGenerator of nodeGenerators) {

		if (isBlockedType(nodeGenerator.name.replace("generate", "")))
			continue

		node = nodeGenerator(["Term", ...context], tokens)

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

	term.start = node.start
	term.end = node.end
	term.value = node

	term.line = node.line
	term.column = node.column

	return term
}

export function generateEitherPropertyAccessOrFunctionCall(context: string[], tokens: TokenStream): PropertyAccess | FunctionCall | MismatchToken {

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken
	const nodeGenerators = [generatePropertyAccess, generateFunctionCall]

	let node: PropertyAccess
		| FunctionCall
		| MismatchToken = createMismatchToken(currentToken)

	node = generateOneOf(tokens, context, nodeGenerators)

	if (node.type == "PropertyAccess" && node.field.type == "FunctionCall") {
		const { field: functionCall } = node, { caller } = functionCall
		node.field = caller as Identifier | Keyword
		node.end = caller.end
		functionCall.caller = node
		node = functionCall
	}

	return node
}

export function generateJustPropertyAccess(context: string[], tokens: TokenStream): PropertyAccess | MismatchToken {

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken
	const nodeGenerators = [generatePropertyAccess, generateFunctionCall]

	let node: PropertyAccess
		| MismatchToken = createMismatchToken(currentToken)

	node = generateOneOf(tokens, context, nodeGenerators)

	if (node.type == "PropertyAccess" && node.field.type == "FunctionCall") {
		const { field: functionCall } = node
		const partialParse: PartialParse = {
			cursor: tokens.cursor,
			result: functionCall
		}
		tokens.cursor = initialCursor
		return createMismatchToken(tokens.currentToken, partialParse)
	}

	return node
}

export function generateJustFunctionCall(context: string[], tokens: TokenStream): FunctionCall | MismatchToken {
	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken
	const nodeGenerators = [generatePropertyAccess, generateFunctionCall]

	let node: PropertyAccess
		| FunctionCall
		| MismatchToken = createMismatchToken(currentToken)

	node = generateOneOf(tokens, context, nodeGenerators)

	if (node.type == "PropertyAccess" && node.field.type == "FunctionCall") {
		const { field: functionCall } = node, { caller } = functionCall
		node.field = caller as Identifier | Keyword
		node.end = caller.end
		functionCall.caller = node
		node = functionCall
	}
	else if (node.type == "PropertyAccess") {
		const partialParse: PartialParse = {
			cursor: tokens.cursor,
			result: node
		}
		tokens.cursor = initialCursor
		return createMismatchToken(tokens.currentToken, partialParse)
	}

	return node
}

export function printTerm(token: Term, indent = 0) {
	const endJoiner = "└── "

	const printers = [
		printMetaDataInterpolation, printTaggedTermPropertyAccess, printTaggedTermFunctionCall, printTaggedSymbol, printSymbolFragment, printTaggedString, printInlineStringFragment, printImplicitMultiplication, printTaggedNumber, printForInline, printMatchInline, printIfInline, printAnonFunction, printUnitFunction, printObjectCascadeNotation, printExternalCallbackNotation, printPipelineNotation,printFunctionCall, printInlineMacroApplication, printDoExpr, printPropertyAccess, printGroupExpression
	] as NodePrinter[]

	const printer = pickPrinter(printers, token.value)!

	const space = " ".repeat(4)
	return "Term" +
		"\n" + space.repeat(indent) + endJoiner + printer(token.value, indent + 1)
}

