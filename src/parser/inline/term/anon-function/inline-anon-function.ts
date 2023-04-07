import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, type Node } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"
import { generateKeyword } from "../../keyword.js"
import { generateParamList } from "../param-list.js"

export function generateInlineAnonFunction(context: string[], tokens: TokenStream): InlineAnonFunction | MismatchToken {
	const inlineAnonFunction: InlineAnonFunction = {
		type: "InlineAnonFunction",
		body: null!,
		parameters: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

    const maybeKeyword = generateKeyword(["InlineAnonFunction", ...context], tokens)

    if(!isKeyword(maybeKeyword, "fun")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    inlineAnonFunction.start = maybeKeyword.start
    inlineAnonFunction.line = maybeKeyword.line
    inlineAnonFunction.column = maybeKeyword.column

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const paramList = generateParamList(["InlineAnonFunction", ...context], tokens)
    if(paramList.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return paramList
    }

    inlineAnonFunction.parameters = paramList
    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    if(!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables)
    const expression = generateExpression(["InlineAnonFunction", ...context], tokens)

    if(expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    inlineAnonFunction.body = expression
    inlineAnonFunction.end = expression.end

	return inlineAnonFunction
}