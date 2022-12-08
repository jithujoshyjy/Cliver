import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility.js"
import { generateDifferenceType } from "./difference-type.js"
import { generateFunctionCallType } from "./function-call-type.js"
import { generateFunctionType } from "./function-type.js"
import { generateIntersectionType } from "./intersection-type.js"
import { generateNegateType } from "./negate-type.js"
import { generateStructureType } from "./structure-type.js"
import { generateTypeExpression } from "./type-expression.js"
import { generateTypeName } from "./type-name.js"

export function generateUnionType(context: Node, tokens: TokenStream): UnionType | MismatchToken {
    const unionType: UnionType = {
        type: "UnionType",
        left: null!,
        right: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    let initialCursor = tokens.cursor
    const typeGenerators = [
        generateIntersectionType, generateDifferenceType, generateNegateType,
        generateFunctionType, generateFunctionCallType, generateStructureType, generateTypeName
    ]

    let typeMember: TypeName | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | StructureType | MismatchToken = null!

    for (let typeGenerator of typeGenerators) {
        typeMember = typeGenerator(unionType, tokens)
        currentToken = tokens.currentToken
        if (typeMember.type != "MismatchToken")
            break
    }

    if (typeMember.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeMember
    }

    unionType.left = typeMember
    currentToken = skip(tokens, skipables)

    if (!isOperator(currentToken, "|")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip |

    const right = generateTypeExpression(unionType, tokens) // buggy :(

    if (right.type == "MismatchToken")
        return right

    unionType.right = right

    return unionType
}