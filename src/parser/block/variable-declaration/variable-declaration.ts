import { TokenStream } from "../../../lexer/token.js"
import { generateTypeExpression } from "../../inline/type/type-expression.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility"
import { generateVariableDeclarator } from "./variable-declarator.js"

export function generateVariableDeclaration(context: Node, tokens: TokenStream): VariableDeclaration | MismatchToken {
    const variableDeclaration: VariableDeclaration = {
        type: "VariableDeclaration",
        declarations: [],
        kind: "var",
        signature: null,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!["var", "val"].includes(currentToken.value as string)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    variableDeclaration.kind = currentToken.value as "var" | "val"

    currentToken = skip(tokens, skipables) // skip var | val

    const captureSignature = () => {
        currentToken = skip(tokens, skipables) // skip ::
        const signature = generateTypeExpression(variableDeclaration, tokens)
        return signature
    }

    if (isOperator(currentToken, "::")) {
        const signature = captureSignature()
        if (signature.type == "MismatchToken")
            return signature
        variableDeclaration.signature = signature
        currentToken = skip(tokens, skipables)
    }

    const captureDeclarator = () => {
        const declarator = generateVariableDeclarator(variableDeclaration, tokens)
        return declarator
    }

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isOperator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const captureDeclarators = () => {
        const declarators: VariableDeclarator[] = []
        while (!tokens.isFinished) {
            const declarator = captureDeclarator()
    
            if (declarator.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return declarator
            }
    
            declarators.push(declarator)

            const comma = captureComma()
    
            if (comma.type == "MismatchToken") {
                break
            }
            currentToken = skip(tokens, skipables)
        }
        return declarators
    }

    const declarators = captureDeclarators()
    if (!Array.isArray(declarators)) {
        tokens.cursor = initialCursor
        return declarators
    }

    variableDeclaration.declarations = declarators

    return variableDeclaration
}