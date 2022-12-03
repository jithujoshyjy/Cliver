import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generatePipelineNotation(context: Node, tokens: TokenStream): PipelineNotation | MismatchToken {
    const pipelineNotation: PipelineNotation = {
        type: "PipelineNotation",
        expression: null!,
        pipes: [],
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return pipelineNotation
}