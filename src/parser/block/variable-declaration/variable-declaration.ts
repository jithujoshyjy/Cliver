import { TokenStream } from "../../../lexer/token.js"
import { generateIdentifier } from "../../inline/literal/identifier.js"
import { generateTypeExpression } from "../../inline/type/type-expression.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node, isKeyword } from "../../utility.js"
import { generateVariableDeclarator } from "./variable-declarator.js"

export function generateVariableDeclaration(context: string[], tokens: TokenStream): VariableDeclaration | MismatchToken {
    const variableDeclaration: VariableDeclaration = {
        type: "VariableDeclaration",
        declarations: [],
        kind: "var",
        signature: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const varOrValKeyword = generateIdentifier(["VariableDeclaration", ...context], tokens)
    if (varOrValKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return varOrValKeyword
    }

    if (!["var", "val"].includes(varOrValKeyword.name)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    variableDeclaration.start = varOrValKeyword.start
    variableDeclaration.line = varOrValKeyword.line
    variableDeclaration.column = varOrValKeyword.column
    variableDeclaration.kind = varOrValKeyword.name as "var" | "val"

    const captureSignature = () => {
        currentToken = skip(tokens, skipables) // skip ::
        const signature = generateTypeExpression(["VariableDeclaration", ...context], tokens)
        return signature
    }

    if (isOperator(currentToken, "::")) {
        const signature = captureSignature()
        if (signature.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return signature
        }
        variableDeclaration.signature = signature
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken
    }

    const captureDeclarator = () => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken
        
        const declarator = generateVariableDeclarator(["VariableDeclaration", ...context], tokens)
    
        currentToken = tokens.currentToken
        return declarator
    }

    const captureComma = () => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        if (!isPunctuator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        currentToken = skip(tokens, skipables)
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

            if (comma.type == "MismatchToken")
                break

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

export function printVariableDeclaration(token: VariableDeclaration, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "VariableDeclaration" + '\n'
}