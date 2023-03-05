import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isBlockedType, isOperator, skip, skipables, _skipables, type Node } from "../../utility.js"
import { generateFunctionCallType } from "./function-call-type.js"
import { generateTupleType } from "./tuple-type.js"
import { generateTypeExpression } from "./type-expression.js"
import { generateTypeName } from "./type-name.js"

export function generateFunctionType(context: string[], tokens: TokenStream): FunctionType | MismatchToken {
    const functionType: FunctionType = {
        type: "FunctionType",
        body: null!,
        head: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    const headGenerators = [
        generateFunctionCallType, generateTypeName, generateTupleType
    ]

    let typeMember: FunctionCallType | TypeName | TupleType | MismatchToken = null!

    for (let headGenerator of headGenerators) {
        if (isBlockedType(headGenerator.name.replace("generate", '')))
            continue
        
        typeMember = headGenerator(["FunctionType", ...context], tokens) as FunctionCallType | TypeName | TupleType | MismatchToken
        if (typeMember.type != "MismatchToken")
            break
    }

    if (typeMember.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeMember
    }

    functionType.head = typeMember

    currentToken = skip(tokens, _skipables) // ->
    if (!isOperator(currentToken, "->")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip ->

    const body = generateTypeExpression(["FunctionType", ...context], tokens) // buggy :(
    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    functionType.body = body

    return functionType
}