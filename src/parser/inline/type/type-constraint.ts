import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node } from "../../utility.js"
import { generateTupleLiteral } from "../literal/tuple-literal.js"
import { generateFunctionType } from "./function-type.js"
import { generateStructureType } from "./structure-type.js"

export function generateTypeConstraint(context: string[], tokens: TokenStream): TypeConstraint | MismatchToken {
	const typeConstraint: TypeConstraint = {
		type: "TypeConstraint",
		assert: null,
		structure: null,
		body: null,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	const currentToken = tokens.currentToken

	/* const typeGenerators = [
        generateFunctionType, generateTupleLiteral, generateStructureType
    ]

    let typeMember: FunctionType | TupleLiteral | StructureType | MismatchToken = null!

    for (let typeGenerator of typeGenerators) {
        typeMember = typeGenerator(typeConstraint, tokens) as FunctionType | TupleLiteral | StructureType | MismatchToken
        if (typeMember.type != "MismatchToken")
            break

        currentToken = tokens.currentToken
    }

    if (typeMember.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeMember
    }

    if (typeMember.type == "FunctionType") {
        typeConstraint.assert = typeMember
    }
    else if (typeMember.type == "TupleLiteral") {

        const areAssertions = typeMember.values.every(x => {
            const maybeTerm = x.value
            if (maybeTerm.type != "Term")
                return false
            
            const maybeAssertion = maybeTerm.value
            if (maybeAssertion.type != "TypeAssertion")
                return false
            
            const maybeLiteral = maybeAssertion.left.value
            if(maybeLiteral.type != "Literal")
                return false
            
            const maybeIdentifier = maybeLiteral.value
            if(maybeIdentifier.type != "Identifier")
                return false
            
            return true
        })

        if(!areAssertions) {
            const error = `Expected valid type assertions on ${currentToken.line}:${currentToken.column}`
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken, error)
        }

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
    } */

	return typeConstraint
}