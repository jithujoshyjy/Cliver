import { TokenStream } from "../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, type Node } from "./utility.js"

export function generateComment(tokens: TokenStream): CommentLiteral | MismatchToken {
    const comment: CommentLiteral = {
        type: "CommentLiteral",
        value: "",
        kind: "inline",
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!isPunctuator(currentToken, "#")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    comment.start = currentToken.start

    tokens.advance()
    currentToken = tokens.currentToken

    if (!isOperator(currentToken, "=")) {
        while (!tokens.isFinished) {

            comment.end = currentToken.end
            if (["Newline", "EOF"].includes(currentToken.type))
                break

            comment.value += currentToken.value

            tokens.advance()
            currentToken = tokens.currentToken
        }

        return comment
    }

    comment.kind = "block"

    void function parseBlockComment() {
        tokens.advance()
        currentToken = tokens.currentToken

        while (!tokens.isFinished) {
            comment.end = currentToken.end

            if (currentToken.type == "EOF")
                break

            if (isOperator(currentToken, "=")) {
                tokens.advance()
                currentToken = tokens.currentToken

                if (isPunctuator(currentToken, "#")) {
                    comment.end = currentToken.end
                    break
                }

                comment.value += "="
                continue
            }

            if (isPunctuator(currentToken, "#")) {
                tokens.advance()
                currentToken = tokens.currentToken

                if (isOperator(currentToken, "=")) {
                    comment.end = currentToken.end
                    parseBlockComment()
                }
                else
                    comment.value += "#"

                continue
            }

            comment.value += currentToken.value

            tokens.advance()
            currentToken = tokens.currentToken
        }
    }()

    return comment
}