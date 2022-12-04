import { TokenStream } from "../../../lexer/token.js"
import { generateVariableDeclarator } from "../../block/variable-declaration/variable-declarator.js"
import { createMismatchToken, type Node } from "../../utility"

export function generateAssignExpr(context: Node, tokens: TokenStream): AssignExpr | MismatchToken {
    const assignExpr: AssignExpr = {
        type: "AssignExpr",
        left: null!,
        right: null!,
        signature: null,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken 
    const initialCursor = tokens.cursor

    const declarator = generateVariableDeclarator(assignExpr, tokens)
    if(declarator.type == "MismatchToken") {

        tokens.cursor = initialCursor
        return declarator
    }

    currentToken = tokens.currentToken
    if(declarator.right == null) {

        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    assignExpr.left = declarator.left
    assignExpr.right = declarator.right
    assignExpr.signature = declarator.signature

    return assignExpr
}