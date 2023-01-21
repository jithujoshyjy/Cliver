import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility.js"
import { generateFunctionCallType } from "./function-call-type.js"
import { generateFunctionType } from "./function-type.js"
import { generateIntersectionType } from "./intersection-type.js"
import { generateNegateType } from "./negate-type.js"
import { generateStructureType } from "./structure-type.js"
import { generateTypeExpression } from "./type-expression.js"
import { generateTypeName } from "./type-name.js"
import { generateUnionType } from "./union-type.js"


export function generateDifferenceType(context: Node, tokens: TokenStream): DifferenceType | MismatchToken {
    const differenceType: DifferenceType = {
        type: "DifferenceType",
        left: null!,
        right: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    let initialCursor = tokens.cursor
    const typeGenerators = [
        generateIntersectionType, generateUnionType, generateNegateType,
        generateFunctionType, generateFunctionCallType, generateStructureType, generateTypeName
    ]

    let typeMember: TypeName | IntersectionType | NegateType | UnionType | FunctionType | FunctionCallType | StructureType | MismatchToken = null!

    for (let typeGenerator of typeGenerators) {
        typeMember = typeGenerator(differenceType, tokens)
        currentToken = tokens.currentToken

        if (typeMember.type != "MismatchToken")
            break

        if (typeMember.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return typeMember
        }
    }

    if (typeMember.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeMember
    }

    differenceType.left = typeMember
    if (skipables.includes(currentToken))
        currentToken = skip(tokens, skipables)

    if (!isOperator(currentToken, "-")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip -

    const right = generateTypeExpression(differenceType, tokens)

    if (right.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return right
    }

    differenceType.right = right

    return differenceType
}