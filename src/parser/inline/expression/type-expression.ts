import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node } from "../../utility"
import { generateDifferenceType } from "./difference-type.js"
import { generateFunctionCallType } from "./function-call-type.js"
import { generateFunctionType } from "./function-type.js"
import { generateIntersectionType } from "./intersection-type.js"
import { generateNegateType } from "./negate-type.js"
import { generateStructureType } from "./structure-type.js"
import { generateTupleType } from "./tuple-type.js"
import { generateTypeConstraint } from "./type-constraint.js"
import { generateTypeName } from "./type-name.js"
import { generateUnionType } from "./union-type.js"

export function generateTypeExpression(context: Node, tokens: TokenStream): TypeExpression | MismatchToken {
    const typeExpression: TypeExpression = {
        type: "TypeExpression",
        body: null!,
        constraint: null,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    let initialCursor = tokens.cursor
    const typeGenerators = [
        generateIntersectionType, generateUnionType, generateDifferenceType,
        generateNegateType, generateFunctionType, generateFunctionCallType, generateTupleType, generateStructureType, generateTypeName
    ]

    let typeMember: TypeName | UnionType | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | TupleType | StructureType | MismatchToken

    for (let typeGenerator of typeGenerators) {
        typeMember = typeGenerator(typeExpression, tokens)
        if (typeMember.type != "MismatchToken")
            break

        currentToken = tokens.currentToken
        tokens.cursor = initialCursor
    }

    if (typeMember!.type == "MismatchToken")
        return typeMember!

    typeExpression.body = typeMember!
    currentToken = skip(tokens, skipables)

    if(isKeyword(currentToken, "where")) {
        const typeConstraint = generateTypeConstraint(typeExpression, tokens)
        if(typeConstraint.type == "MismatchToken")
            return typeConstraint
        typeExpression.constraint = typeConstraint
    }

    return typeExpression
}