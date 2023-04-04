import { TokenStream } from "../../../lexer/token.js"
import { skip, _skipables, createMismatchToken, isPunctuator, isBlockedType, withBlocked, withUnblocked, getPartialParsed, PartialParse } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generateKeyword } from "../keyword.js"
import { generateDoExpr } from "./do-expr.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateOperatorRef } from "../literal/operator-ref.js"
import { generateCallSiteArgsList } from "./call-site-args-list.js"
import { generateImplicitMultiplication } from "./implicit-multiplication.js"
import { generateTaggedNumber } from "./tagged-number.js"
import { generateTaggedString } from "./tagged-string/tagged-string.js"
import { generateTaggedSymbol } from "./tagged-symbol.js"
import { generatePropertyAccess } from "./property-access.js"

export function generateFunctionCall(context: string[], tokens: TokenStream): FunctionCall | MismatchToken {
	let functionCall: FunctionCall = {
		type: "FunctionCall",
		arguments: null!,
		caller: null!,
		externcallback: false,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const nodeGenerators = [
		generateDoExpr, generateTaggedNumber, generateImplicitMultiplication,
		generateIdentifier, generateKeyword, generateGroupExpression, generateOperatorRef
	]

	let caller: Identifier
		| Keyword
		| DoExpr
		| PropertyAccess
		| OperatorRef
		| TaggedNumber
		| ImplicitMultiplication
		| GroupExpression
		| FunctionCall
		| MismatchToken = null!

	const callbackKws = ["import", "export", "use", "from", "type"]
	
	for (const nodeGenerator of nodeGenerators) {

		if (isBlockedType(nodeGenerator.name.replace("generate", "")))
			continue

		caller = withBlocked(["FunctionCall"],
			() => nodeGenerator(["FunctionCall", ...context], tokens))
		currentToken = tokens.currentToken

		if (caller.type != "MismatchToken") {
			if (caller.type == "Keyword" && !callbackKws.includes(caller.name)) {
				tokens.cursor = initialCursor
				return createMismatchToken(currentToken)
			}
			break
		}

		if (caller.errorDescription.severity <= 3) {
			tokens.cursor = initialCursor
			return caller
		}
	}

	if (caller.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return caller
	}

	functionCall.caller = caller
	let isInitial = true

	while (!tokens.isFinished) {
		currentToken = _skipables.includes(tokens.currentToken)
			? skip(tokens, _skipables)
			: tokens.currentToken

		if (!isPunctuator(currentToken, "(") && !isInitial)
			break

		if (!isPunctuator(currentToken, "(")) {
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken)
		}

		const unblockedTypes = [
			"FunctionCall", "PropertyAccess",
			"TaggedSymbol", "TaggedString"
		]

		const args: CallSiteArgsList | MismatchToken
			= withUnblocked(unblockedTypes, () => generateCallSiteArgsList(["FunctionCall", ...context], tokens))

		if (args.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return args
		}

		isInitial = false
		if (functionCall.arguments) {
			const parentFunctionCall = Object.assign({}, functionCall)
			parentFunctionCall.caller = functionCall

			parentFunctionCall.arguments = args
			parentFunctionCall.end = args.end
			parentFunctionCall.externcallback = args.positional.some(x => x.type == "FunctionPrototype")

			functionCall = parentFunctionCall
			continue
		}

		functionCall.arguments = args
		functionCall.end = args.end
		functionCall.externcallback = args.positional.some(x => x.type == "FunctionPrototype")
	}

	return functionCall
}

export function generateTaggedTermFunctionCall(context: string[], tokens: TokenStream): FunctionCall | MismatchToken {
	let functionCall: FunctionCall = {
		type: "FunctionCall",
		arguments: null!,
		caller: null!,
		externcallback: false,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const nodeGenerators = [
		generateTaggedSymbol, generateTaggedString
	]

	let caller: TaggedSymbol
		| TaggedString
		| MismatchToken = null!

	let partialParsed = getPartialParsed()?.PropertyAccess
	if (!(caller = partialParsed?.result as typeof caller))
		for (const nodeGenerator of nodeGenerators) {

			if (isBlockedType(nodeGenerator.name.replace("generate", "")))
				continue

			caller = withBlocked(["FunctionCall"],
				() => nodeGenerator(["FunctionCall", ...context], tokens))

			currentToken = tokens.currentToken
			if (caller.type != "MismatchToken")
				break

			if (caller.errorDescription.severity <= 3) {
				tokens.cursor = initialCursor
				return caller
			}
		}
	else {
		tokens.cursor = partialParsed.cursor
		currentToken = tokens.currentToken
	}

	if (!caller) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	if (caller.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return caller
	}

	functionCall.caller = caller

	if (currentToken.type == "EOF") {
		const partialParse: PartialParse = {
			result: caller,
			cursor: tokens.cursor
		}
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken, partialParse)
	}

	let isInitial = true

	while (!tokens.isFinished) {
		currentToken = _skipables.includes(tokens.currentToken)
			? skip(tokens, _skipables)
			: tokens.currentToken

		if (!isPunctuator(currentToken, "(") && !isInitial)
			break

		if (!isPunctuator(currentToken, "(")) {
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken)
		}

		const unblockedTypes = [
			"FunctionCall", "PropertyAccess",
			"TaggedSymbol", "TaggedString"
		]

		const args: CallSiteArgsList | MismatchToken
			= withUnblocked(unblockedTypes, () => generateCallSiteArgsList(["FunctionCall", ...context], tokens))

		if (args.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return args
		}

		isInitial = false
		if (functionCall.arguments) {
			const parentFunctionCall = Object.assign({}, functionCall)
			parentFunctionCall.caller = functionCall

			parentFunctionCall.arguments = args
			parentFunctionCall.end = args.end
			parentFunctionCall.externcallback = args.positional.some(x => x.type == "FunctionPrototype")

			functionCall = parentFunctionCall
			continue
		}

		functionCall.arguments = args
		functionCall.end = args.end
		functionCall.externcallback = args.positional.some(x => x.type == "FunctionPrototype")
	}

	return functionCall
}

export function printFunctionCall(token: FunctionCall, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "FunctionCall\n"
}

export function printTaggedTermFunctionCall(token: FunctionCall, indent = 0) {
	return printFunctionCall(token, indent)
}