import { TokenStream } from "../lexer/token.js"
import { generateBlock } from "./block/block.js"
import { generateInline } from "./inline/inline.js"
import { type Node } from "./utility.js"

export type ProgramGenerator = Generator<Inline | Block | MismatchToken, Array<Inline | Block> | MismatchToken>
export function* generateProgram(context: Node, tokens: TokenStream): ProgramGenerator {
    const values: Array<Block | Inline> = []
    const baseContext = context
    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    baseContext.start = currentToken.start
    while (currentToken.type != "EOF") {

        const block = generateBlock(context, tokens)
        let value: Block | Inline | MismatchToken = block

        // is not block
        if (value.type == "MismatchToken") {
            const inline = generateInline(context, tokens)
            value = inline
        }
        else { // is macro-block
            const block = value.value
            if (block.type == "BlockMacroApplication") {
                block.left = [...values]
                values.length = 0
                values.push(value)
                context = block
            }
        }

        // is not inline
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            yield value
        }

        // is macro-block
        if (context.type == "BlockMacroApplication")
            (context as BlockMacroApplication).right.push(value as Block | Inline)
        else {// is block or inline
            values.push(value as Block | Inline)
            yield value
        }
        currentToken = tokens.currentToken
    }
    baseContext.end = currentToken.end

    if (context.type == "BlockMacroApplication")
        yield values.at(-1) as Block

    context = baseContext // Program

    return values
}