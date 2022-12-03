import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generatePropertyAccess(context: Node, tokens: TokenStream): PropertyAccess | MismatchToken {
    const propertyAccess: PropertyAccess = {
        type: "PropertyAccess",
        accessor: null!,
        field: null!,
        computed: false,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return propertyAccess
}