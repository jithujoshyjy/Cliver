import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generatePropertyAccess(context: Node, tokens: TokenStream): PropertyAccess | MismatchToken {
    const propertyAccess: PropertyAccess = {
        type: "PropertyAccess",
        accessor: null!,
        field: null!,
        computed: false,
        start: 0,
        end: 0
    }

    return propertyAccess
}