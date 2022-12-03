import { TokenStream, TokenType } from "../../../lexer/token.js"
import { skip, skipables, type Node } from "../../utility"
import { generateFunctionType } from "./function-type.js"
import { generateStructureType } from "./structure-type.js"
import { generateTupleType } from "./tuple-type.js"

export function generateTypeConstraint(context: Node, tokens: TokenStream): TypeConstraint | MismatchToken {
    const typeConstraint: TypeConstraint = {
        type: "TypeConstraint",
        assert: null,
        structure: null,
        body: null,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    const typeGenerators = [
        generateFunctionType, generateTupleType, generateStructureType
    ]

    let typeMember: FunctionType | TupleType | StructureType | MismatchToken = null!

    for (let typeGenerator of typeGenerators) {
        typeMember = typeGenerator(typeConstraint, tokens)
        if (typeMember.type != "MismatchToken")
            break

        currentToken = tokens.currentToken
        tokens.cursor = initialCursor
    }

    if (typeMember.type == "MismatchToken")
        return typeMember

    if (typeMember.type == "FunctionType") {
        typeConstraint.assert = typeMember
    }
    else if (typeMember.type == "TupleType") {
        typeConstraint.body = typeMember
        currentToken = skip(tokens, skipables)

        if (currentToken.type == TokenType.BraceEnclosed) {
            typeMember = generateStructureType(typeConstraint, tokens)
            if (typeMember.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return typeMember
            }
            typeConstraint.structure = typeMember
        }
    }
    else {
        typeConstraint.structure = typeMember
    }

    return typeConstraint
}