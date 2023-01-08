import { TokenStream } from "../../../../lexer/token.js"
import { skip, skipables, type Node } from "../../../utility.js"
import { generateAsExpression } from "../../expression/as-expression.js"
import { generateExpression } from "../../expression/expression.js"
import { generateErrorPipeline } from "./error-pipeline.js"
import { generateTransformPipeline } from "./transform-pipeline.js"

export function generatePipelineNotation(context: Node, tokens: TokenStream): PipelineNotation | MismatchToken {
    const pipelineNotation: PipelineNotation = {
        type: "PipelineNotation",
        expression: null!,
        pipes: [],
        kind: "pointfree",
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let expression: AsExpression | Expression | MismatchToken = generateAsExpression(pipelineNotation, tokens)
    if (expression.type == "MismatchToken") {
        expression = generateExpression(pipelineNotation, tokens)
    }

    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    pipelineNotation.expression = expression
    pipelineNotation.kind = expression.type == "AsExpression" ? "pointed" : "pointfree"

    while(!tokens.isFinished) {
        const pipe = parsePipe()
        currentToken = tokens.currentToken

        if(pipe.type == "MismatchToken" && pipelineNotation.pipes.length == 0) {
            tokens.cursor = initialCursor
            return pipe
        }

        if(pipe.type == "MismatchToken") {
            break
        }

        pipelineNotation.pipes.push(pipe)
    }

    return pipelineNotation

    function parsePipe() {
        currentToken = skip(tokens, skipables) // `` | .`` | ??
        let pipe: TransformPipeline
            | ErrorPipeline
            | MismatchToken = generateTransformPipeline(pipelineNotation, tokens)

        if(pipe.type == "MismatchToken") {
            pipe = generateErrorPipeline(pipelineNotation, tokens)
        }

        return pipe
    }
}