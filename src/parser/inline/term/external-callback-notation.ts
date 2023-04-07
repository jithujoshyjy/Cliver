import { TokenStream } from "../../../lexer/token.js"
import { skip, skipables, PartialParse, createMismatchToken } from "../../utility.js"
import { generateDoExpr } from "./do-expr.js"
import { generateFunctionCall } from "./function-call.js"

export function generateExternalCallbackNotation(context: string[], tokens: TokenStream): ExternalCallbackNotation | MismatchToken {
	const externalCallbackNotation: ExternalCallbackNotation = {
		type: "ExternalCallbackNotation",
		callback: null!,
		caller: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const functionCall = generateFunctionCall(["ExternalCallbackNotation", ...context], tokens)
	if(functionCall.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return functionCall
	}
    
	if(!functionCall.externcallback) {
		const partialParse: PartialParse = {
			result: functionCall,
			cursor: tokens.cursor
		}
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken, partialParse)
	}

	externalCallbackNotation.caller = functionCall
	externalCallbackNotation.start = functionCall.start
	externalCallbackNotation.line = functionCall.line
	externalCallbackNotation.column = functionCall.column

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	const doExpr = generateDoExpr(["ExternalCallbackNotation", ...context], tokens)
	if(doExpr.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return doExpr
	}

	externalCallbackNotation.callback = doExpr
	externalCallbackNotation.end = doExpr.end

	return externalCallbackNotation
}

export function printExternalCallbackNotation(token: ExternalCallbackNotation, indent = 0) {
	const endJoiner = "└── "

	const space = " ".repeat(4)
	return "ExternalCallbackNotation"
}