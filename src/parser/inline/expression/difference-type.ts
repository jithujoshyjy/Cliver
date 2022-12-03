import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility"
import { generateFunctionCallType } from "../type/function-call-type.js"
import { generateFunctionType } from "../type/function-type.js"
import { generateIntersectionType } from "../type/intersection-type.js"
import { generateNegateType } from "../type/negate-type.js"
import { generateStructureType } from "../type/structure-type.js"
import { generateTypeExpression } from "../type/type-expression.js"
import { generateTypeName } from "../type/type-name.js"
import { generateUnionType } from "../type/union-type.js"


export function generateDifferenceType(context: Node, tokens: TokenStream): DifferenceType | MismatchToken {
    const differenceType: DifferenceType = {
        type: "DifferenceType",
        left: null!,
        right: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    let initialCursor = tokens.cursor
    const typeGenerators = [
        generateIntersectionType, generateUnionType, generateNegateType,
        generateFunctionType, generateFunctionCallType, generateStructureType, generateTypeName
    ]

    let typeMember: TypeName | IntersectionType | NegateType | UnionType | FunctionType | FunctionCallType | StructureType | MismatchToken

    for (let typeGenerator of typeGenerators) {
        typeMember = typeGenerator(differenceType, tokens)
        currentToken = tokens.currentToken
        if (typeMember.type != "MismatchToken")
            break
    }

    if (typeMember!.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeMember!
    }

    differenceType.left = typeMember!
    currentToken = skip(tokens, skipables)

    if (!isOperator(currentToken, "&")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip -

    const right = generateTypeExpression(differenceType, tokens)

    if (right.type == "MismatchToken")
        return right

    differenceType.right = right

    return differenceType
}