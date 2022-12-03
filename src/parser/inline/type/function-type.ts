import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, _skipables, type Node } from "../../utility"
import { generateFunctionCallType } from "./function-call-type.js"
import { generateTupleType } from "./tuple-type.js"
import { generateTypeExpression } from "./type-expression.js"
import { generateTypeName } from "./type-name.js"

export function generateFunctionType(context: Node, tokens: TokenStream): FunctionType | MismatchToken {
    const functionType: FunctionType = {
        type: "FunctionType",
        body: null!,
        head: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    const headGenerators = [
        generateFunctionCallType, generateTypeName, generateTupleType
    ]

    let typeMember: FunctionCallType | TypeName | TupleType | MismatchToken

    for (let headGenerator of headGenerators) {
        typeMember = headGenerator(functionType, tokens)
        if (typeMember.type != "MismatchToken")
            break
    }

    if (typeMember!.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeMember!
    }

    functionType.head = typeMember!

    currentToken = skip(tokens, _skipables) // ->
    if (!isOperator(currentToken, "->")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables) // skip ->

    const body = generateTypeExpression(functionType, tokens)
    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    functionType.body = body

    return functionType
}