import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateInline(context: Node, tokens: TokenStream): Inline | MismatchToken {
    const inline = {
        type: "Inline",
        value: null,
        start: 0,
        end: 0
    }
    // if (token.type == TokenType.Keyword) {
    //     const keyword = token.value as string;
    //     if (keyword == "import") {
    //         generateImport(ast, tokens);
    //     }
    // }
    // else if (token.type == TokenType.Punctuator) {
    //     const punctuator = token.value as string;
    //     if (punctuator == "$") {
    //         generateMetaDataInterpolation(ast, tokens);
    //     }
    // }
    // else if (token.type == TokenType.BraceEnclosed) {
    //     generateMapLiteral(ast, tokens);
    // }
    // else if (stringLiterals.includes(token.type)) {
    //     const stringLiteral = generateStringLiteral(ast, tokens);
    //     currentContext.value.push(stringLiteral);
    // }
    return inline as unknown as Inline
}