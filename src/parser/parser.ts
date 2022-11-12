import { TokenType, type TokenStream } from "../lexer/token.js";

export function generateAST(tokens: TokenStream): object {
    const commandStr = String.raw`
        abc = def | $ Ghi("1234") | abc
    `

    // @ts-ignore
    console.log(parseTokens(commandStr, tokens))
    const currentToken = tokens.currentToken;
    switch (currentToken?.type ?? '') {
        case TokenType.SingleLineComment:
        case TokenType.MultiLineComment:
            return {};
        case TokenType.IntegerLiteral:
        case TokenType.FloatLiteral:
            return {};
        case TokenType.Keyword:
            return {};
        case TokenType.Identifier:
            return {};
        case TokenType.Operator:
            return {};
        case TokenType.ParenEnclosed:
            return {};
        case TokenType.BraceEnclosed:
            return {};
        case TokenType.BraceEnclosed:
            return {};
        case TokenType.ASCIICharLiteral:
        case TokenType.UnicodeCharLiteral:
            return {};
        case TokenType.SymASCIIStringLiteral:
        case TokenType.SymUnicodeStringLiteral:
            return {};
        case TokenType.SymASCIICharLiteral:
        case TokenType.SymUnicodeCharLiteral:
            return {};
        case TokenType.MultilineASCIIStringLiteral:
        case TokenType.MultilineUnicodeStringLiteral:
            return {};
        case TokenType.InlineASCIIStringLiteral:
        case TokenType.InlineUnicodeStringLiteral:
            return {};
        case TokenType.MultilineFormatString:
            return {};
        case TokenType.InlineFormatString:
            return {};
        case TokenType.Newline:
            return {};
        case TokenType.WhiteSpace:
            return {};
        case TokenType.Punctuator:
            return {};
    }
    return {};
}

interface IVisitor {
    visit(visitable: IVisitable): object
}

interface IVisitable {
    accept(visitor: IVisitor): object
}

class StatementVisitor implements IVisitor {
    visit(visitable: IVisitable): any {
        if (visitable instanceof ImportStatement) {
            visitable.accept(this)
        }
        else if (visitable instanceof UseStatement) {

        }
        else if (visitable instanceof VariableDeclaration) {

        }
        else if (visitable instanceof ValueDeclaration) {

        }
        else if (visitable instanceof TypeDeclaration) {

        }
        else if (visitable instanceof ValuedTypeSignature) {

        }
        else
            throw new Error(`Unknown Statement!`)
    }
}

// Statements
class Statement implements IVisitable {
    accept(visitor: StatementVisitor): object {
        throw new Error("Method not implemented.");
    }
}

class ImportStatement extends Statement {
    accept(visitor: StatementVisitor): object {
        visitor.visit(this)
        throw new Error("Method not implemented.");
    }
}

class UseStatement extends Statement { }
class VariableDeclaration extends Statement { }
class ValueDeclaration extends Statement { }
class TypeDeclaration extends Statement { }
class ValuedTypeSignature extends Statement { }

// Blocks
class Block extends Statement { }
class NamedFunction extends Block { }
class IfBlock extends Block { }
class ForBlock extends Block { }
class DoBlock extends Block { }
class BlockMacro extends Block { }
class Label extends Block { }

// Terms
class Term implements IVisitable {
    accept(visitor: IVisitor): object {
        throw new Error("Method not implemented.");
    }
}
class AssignExpr extends Term { }
class AnonFunction extends Term { }
class AnonTypeSignature extends Term { }
class PipelineConstruct extends Term { }
class InlineMacro extends Term { }
class IfExpr extends Term { }
class ForExpr extends Term { }
class DoExpr extends Term { }
class MatchExpr extends Term { }
class TypeExpr extends Term { }
class AsExpr extends Term { }
class MacroInvocation extends Term { }
class UnitFunction extends Term { }
class StringFragment extends Term { }
class SymFragment extends StringFragment { }
class CharFragment extends StringFragment { }
class InfixCallNotation extends Term { }
class ObjectExtendNotation extends Term { }
class ObjectCascadeNotation extends Term { }
class ExternalCallbackNotation extends Term { }

// Literals
class Literal extends Term { }
class FunctionCall extends Literal { }
class PropertyDotAccess extends Literal { }
class ProperyBracketAccess extends Literal { }
class TaggedString extends Literal { }
class TaggedNumber extends Literal { }
class NumericLiteral extends Literal { }
class IntegerLiteral extends NumericLiteral { }
class FloatLiteral extends NumericLiteral { }
class ImplicitMultip extends Literal { }
class StringLiteral extends Literal { }
class SymbolicLiteral extends StringLiteral { }
class SymbolicStringLiteral extends SymbolicLiteral { }
class SymbolicCharLiteral extends SymbolicLiteral { }
class CharLiteral extends Literal { }
class Identifier extends Literal { }
class MetaDataInterp extends Literal { }
class TupleLiteral extends Literal { }
class ArrayLiteral extends Literal { }
class CurlyBraceEnclosed extends Literal { }
class OperatorRef extends Literal { }

function parseTokens(commandStr: string, stream: TokenStream) {

    const isUpperCase = (char: string) => char && /[A-Z]/u.test(char)
    const isLowerCase = (char: string) => char && /[a-z]/u.test(char)
    const isAlnum = (char: string) => char && /[\p{Letter}0-9_]/u.test(char)
    const isLParan = (char: string) => char && /\(/u.test(char)
    const isRParan = (char: string) => char && /\)/u.test(char)
    const isDollar = (char: string) => char && /\$/u.test(char)
    const isPlus = (char: string) => char && /\+/u.test(char)
    const isStar = (char: string) => char && /\*/u.test(char)
    const isQuest = (char: string) => char && /\?/u.test(char)
    const isPipe = (char: string) => char && /\|/u.test(char)
    const isAssign = (char: string) => char && /=/u.test(char)
    const isNonSpace = (char: string) => char && /\S/u.test(char)
    const isNewline = (char: string) => char && /\n/u.test(char)
    const isComma = (char: string) => char && /,/u.test(char)
    const isQuote = (char: string) => char && /"/u.test(char)
    const isBackslash = (char: string) => char && /\\/u.test(char)

    type Token = {
        value?: string | Token | Token[],
        type: string,
        parent?: Token,
        left?: Token | Token[],
        right?: Token[],
        args?: Token[],
        caller?: string
    }
    const topLevel: Token = { type: "TopLevel", value: [] }
    let context: Token = topLevel

    const addToContext = (token: Token) => {
        token.parent = context
        if (context.type == "TopLevel")
            (context.value as Token[]).push(token)
        else if (context.type == "Assignment")
            (context.right as Token[]).push(token)
        else if (context.type == "Group")
            (context.value as Token[]).push(token)
        else if (context.type == "SemiGroup")
            (context.value as Token[]).push(token)
        else if (context.type == "Either")
            (context.right as Token[]).push(token)
        else if (context.type == "FunctionCall")
            (context.args as Token[]).push(token)
    }

    const popContext = () => {
        if (context.type == "Assignment")
            return (context.right as Token[]).pop()
        else if (context.type == "Group")
            return (context.value as Token[]).pop()
        else if (context.type == "SemiGroup")
            return (context.value as Token[]).pop()
        else if (context.type == "Either")
            return (context.right as Token[]).pop()
        else if (context.type == "FunctionCall")
            return (context.args as Token[]).pop()
        throw new Error(`Cannot pop value from the current context: ${context.type}`)
    }

    const throwable = (expectedCtx: string | string[], char: string) => {
        if (typeof expectedCtx == "string"
            && context.type != expectedCtx
            || !expectedCtx.includes(context.type))
            throw new Error(`Unexpected character '${char}'`)
    }

    let i = 0;
    while (i < commandStr.length) {
        let char = commandStr[i]

        const consumeChar = () => {
            const _char = char;
            i++; char = commandStr[i];

            return _char
        }

        if (context.type == "TopLevel") {
            if (isLowerCase(char)) {
                let res = ''

                while (isAlnum(char))
                    res += consumeChar()

                const left = { value: res, type: "Identifier" }
                const token = { left, right: [], type: "Assignment" }

                addToContext(token)
                context = token
            }
            else if (isNonSpace(char)) {
                throwable("", char)
            }
            else consumeChar()
        }
        else if (isAssign(char)) {

            throwable("Assignment", char)
            consumeChar()
        }
        else if (isLowerCase(char)) {
            let res = ''

            while (isAlnum(char))
                res += consumeChar()

            const token = { value: res, type: "Identifier" }
            addToContext(token)
        }
        else if (isUpperCase(char)) {
            let res = ''
            res += consumeChar()

            while (isAlnum(char))
                res += consumeChar()

            const token = { caller: res, args: [], type: "FunctionCall" }
            addToContext(token)

            context = token
        }
        else if (isLParan(char)) {
            consumeChar()

            const token = { value: [], type: "Group" }
            addToContext(token)

            context = token
        }
        else if (isRParan(char)) {

            while (context.type != "Assignment") {
                throwable(["Group", "SemiGroup", "Either"], char)
                if (context.type == "Group") {
                    const { value } = context
                    context = context.parent!

                    if (context.type == "FunctionCall")
                        context = context.parent!,
                            context.args = value as Token[]
                    break
                }
            }

            consumeChar()
        }
        else if (isComma(char)) {
            throwable("Group", char)
            consumeChar()
        }
        else if (isQuote(char)) {
            let res = ''
            consumeChar()

            while (i < commandStr.length) {
                if (isBackslash(char) && i + 1 < commandStr.length)
                    res += consumeChar() + consumeChar()
                else if (isQuote(char)) {
                    consumeChar()
                    break
                }
                else
                    res += consumeChar()
            }

            const token = { value: res, type: "RawValue" }
            addToContext(token)
        }
        else if (isDollar(char)) {
            consumeChar()

            const token = { value: [], type: "SemiGroup" }
            addToContext(token)

            context = token
        }
        else if (isPlus(char)) {

            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext()
            if (value === undefined) {
                throwable("", char)
            }

            const token = { value, type: "OneOrMoreQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isStar(char)) {
            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext()
            if (value === undefined) {
                throwable("", char)
            }

            const token = { value, type: "ZeroOrMoreQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isQuest(char)) {
            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext()
            if (value === undefined)
                throwable("", char)

            const token = { value, type: "AtmostOneQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isPipe(char)) {
            consumeChar()

            const left: Token[] = []
            let value: Token | undefined

            while (value = popContext())
                left.push(value)

            const token = { left, right: [], type: "Either" }
            addToContext(token)

            context = token
        }
        else if (isNewline(char) && context.type == "Assignment") {

            consumeChar()
            if (context.right?.length)
                context = topLevel

        }
        else if (isNonSpace(char)) {
            throwable("", char)
        }
        else consumeChar()
    }
    return topLevel
}
