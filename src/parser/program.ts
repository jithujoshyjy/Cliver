import { TokenStream } from "../lexer/token"
import { generateBlock } from "./block/block"
import { generateInline } from "./inline/inline"
import { type Node } from "./utility"

export function generateProgram(context: Node, tokens: TokenStream): Array<Inline | Block> | MismatchToken {

    const values: Array<Block | Inline> = []
    let mismatch: MismatchToken | null = null

    while (!tokens.isFinished) {
        const block = generateBlock(context, tokens)
        const inline = generateInline(context, tokens)
        let value: Block | Inline

        const allMismatch = [block, inline].every(x => {
            const isMismatch = x.type == "MismatchToken"
            if (!isMismatch)
                value = x
            else
                mismatch ??= isMismatch ? x : null
            return isMismatch
        })

        if (allMismatch)
            return mismatch!
        
        values.push(value!)
    }

    return values
}