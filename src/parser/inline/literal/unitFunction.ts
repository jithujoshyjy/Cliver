import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateUnitFunction(context: Node, tokens: TokenStream): UnitFunction | MismatchToken {
    const unitFunction = {
        type: "UnitFunction",
        params: [],
        signature: null,
        body: null,
        start: 0,
        end: 0
    }

    return unitFunction as unknown as UnitFunction
}