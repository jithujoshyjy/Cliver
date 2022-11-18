import { type TokenStream, type Token as ProgramToken } from "../lexer/token"

interface ResultKind {
    ok: boolean
}

interface Ok<L> extends ResultKind {
    value: L
}

interface Err<R> extends ResultKind {
    error: R
}

type Result<L, R> = Ok<L> | Err<R>

const Ok = <T>(value: T): Ok<T> => ({ ok: true, value })
const Err = <T>(error: T): Err<T> => ({ ok: false, error })

type GrammarToken = (Identifier
    | TopLevel
    | Assignment
    | FunctionCall
    | Group
    | SemiGroup
    | RawValue
    | OneOrMoreQuantifier
    | ZeroOrMoreQuantifier
    | AtmostOneQuantifier
    | Either)
    & { type: string, parent?: GrammarToken }

type TermsArray = Array<Exclude<GrammarToken, TopLevel | Assignment | RawValue>>

type Identifier = {
    type: "Identifier"
    value: string,
}

type TopLevel = {
    type: "TopLevel",
    value: Assignment[]
}

type Assignment = {
    type: "Assignment",
    left: Identifier,
    right: Array<Exclude<GrammarToken, TopLevel | RawValue>>
}

type FunctionCall = {
    type: "FunctionCall",
    caller: string,
    args: Array<Exclude<GrammarToken, TopLevel | Assignment>>
}

type Group = {
    type: "Group",
    value: TermsArray
}

type RawValue = {
    type: "RawValue",
    value: string
}

type SemiGroup = {
    type: "SemiGroup",
    value: TermsArray
}

type OneOrMoreQuantifier = {
    value: Identifier | FunctionCall | Group,
    type: "OneOrMoreQuantifier"
}

type ZeroOrMoreQuantifier = {
    value: Identifier | FunctionCall | Group,
    type: "ZeroOrMoreQuantifier"
}

type AtmostOneQuantifier = {
    value: Identifier | FunctionCall | Group,
    type: "AtmostOneQuantifier"
}

type Either = {
    type: "Either",
    left: TermsArray,
    right: TermsArray
}

export function grammaticParse(grammar: string, tokenStream: TokenStream) {

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

    const topLevel: TopLevel = { type: "TopLevel", value: [] }
    let context: GrammarToken = topLevel

    const addToContext = (token: GrammarToken) => {
        token.parent = context
        if (context.type == "TopLevel")
            (context.value as GrammarToken[]).push(token)
        else if (context.type == "Assignment")
            (context.right as GrammarToken[]).push(token)
        else if (context.type == "Group")
            (context.value as GrammarToken[]).push(token)
        else if (context.type == "SemiGroup")
            (context.value as GrammarToken[]).push(token)
        else if (context.type == "Either")
            (context.right as GrammarToken[]).push(token)
        else if (context.type == "FunctionCall")
            (context.args as GrammarToken[]).push(token)
    }

    const popContext = () => {
        if (context.type == "Assignment")
            return (context.right as GrammarToken[]).pop()
        else if (context.type == "Group")
            return (context.value as GrammarToken[]).pop()
        else if (context.type == "SemiGroup")
            return (context.value as GrammarToken[]).pop()
        else if (context.type == "Either")
            return (context.right as GrammarToken[]).pop()
        else if (context.type == "FunctionCall")
            return (context.args as GrammarToken[]).pop()
        throw new Error(`Cannot pop value from the current context: ${context.type}`)
    }

    const throwable = (expectedCtx: string | string[], char: string) => {
        if (typeof expectedCtx == "string"
            && context.type != expectedCtx
            || !expectedCtx.includes(context.type))
            throw new Error(`Unexpected character '${char}'`)
    }

    let i = 0;
    while (i < grammar.length) {
        let char = grammar[i]

        const consumeChar = () => {
            const _char = char;
            i++; char = grammar[i];

            return _char
        }

        if (context.type == "TopLevel") {
            if (isLowerCase(char)) {
                let res = ''

                while (isAlnum(char))
                    res += consumeChar()

                const left: Identifier = { value: res, type: "Identifier" }
                const token: Assignment = { left, right: [], type: "Assignment" }

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

            const token: Identifier = { value: res, type: "Identifier" }
            addToContext(token)
        }
        else if (isUpperCase(char)) {
            let res = ''
            res += consumeChar()

            while (isAlnum(char))
                res += consumeChar()

            const token: FunctionCall = { caller: res, args: [], type: "FunctionCall" }
            addToContext(token)

            context = token
        }
        else if (isLParan(char)) {
            consumeChar()

            const token: Group = { value: [], type: "Group" }
            addToContext(token)

            context = token
        }
        else if (isRParan(char)) {

            while (context.type != "Assignment") {
                throwable(["Group", "SemiGroup", "Either"], char)
                if (context.type == "Group") {
                    const { value } = context
                    context = context.parent!

                    if (context.type == "FunctionCall") {
                        context.args = value as Array<Exclude<GrammarToken, TopLevel | Assignment>>
                        context = context.parent!
                    }
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

            while (i < grammar.length) {
                if (isBackslash(char) && i + 1 < grammar.length)
                    res += consumeChar() + consumeChar()
                else if (isQuote(char)) {
                    consumeChar()
                    break
                }
                else
                    res += consumeChar()
            }

            const token: RawValue = { value: res, type: "RawValue" }
            addToContext(token)
        }
        else if (isDollar(char)) {
            consumeChar()

            const token: SemiGroup = { value: [], type: "SemiGroup" }
            addToContext(token)

            context = token
        }
        else if (isPlus(char)) {

            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext() as Identifier | FunctionCall | Group
            if (value === undefined) {
                throwable("", char)
            }

            const token: OneOrMoreQuantifier = { value, type: "OneOrMoreQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isStar(char)) {
            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext() as Identifier | FunctionCall | Group
            if (value === undefined) {
                throwable("", char)
            }

            const token: ZeroOrMoreQuantifier = { value, type: "ZeroOrMoreQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isQuest(char)) {
            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext() as Identifier | FunctionCall | Group
            if (value === undefined)
                throwable("", char)

            const token: AtmostOneQuantifier = { value, type: "AtmostOneQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isPipe(char)) {
            consumeChar()

            const left: TermsArray = []
            let value: GrammarToken | undefined

            while (value = popContext() as TermsArray[0])
                left.push(value)

            const token: Either = { left, right: [], type: "Either" }
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

    const rules = topLevel.value
    const main = rules.find(rule => rule.left.value == "main")

    if (!main)
        throw new Error(`Entry point 'main' is not specified`)

    new Visitable(main).accept(new Visitor(tokenStream, rules))

    return topLevel
}

type Program = { type: "Program", value: ProgramContext[], parent: null }
type ProgramContext = (Program
    | Rule
    | ProgramGroup
    | ProgramSemiGroup
    | ProgramEither
    | ProgramFunctionCall
    | ProgramAtmostOneQuantifier
    | ProgramZeroOrMoreQuantifier
    | ProgramOneOrMoreQuantifier)
    & { type: string, parent?: ProgramContext | null }

type Rule = {
    type: "Rule",
    name: string,
    value: ProgramContext[],
}

type ProgramGroup = {
    type: "ProgramGroup",
    value: ProgramContext[]
}

type ProgramSemiGroup = {
    type: "ProgramSemiGroup",
    value: ProgramContext[]
}

type ProgramEither = {
    type: "ProgramEither",
    value: ProgramContext[]
}

type ProgramFunctionCall = {
    type: "ProgramFunctionCall",
    value: ProgramContext[]
}

type ProgramAtmostOneQuantifier = {
    value: ProgramContext,
    type: "ProgramAtmostOneQuantifier"
}

type ProgramZeroOrMoreQuantifier = {
    value: ProgramContext[],
    type: "ProgramZeroOrMoreQuantifier"
}

type ProgramOneOrMoreQuantifier = {
    value: ProgramContext[],
    type: "ProgramOneOrMoreQuantifier"
}

class Visitor {
    constructor(private tokenStream: TokenStream, private rules: GrammarToken[]) { }

    program: Program = {
        type: "Program",
        value: [],
        parent: null
    }

    context: ProgramContext = this.program

    #addToContext = (token: ProgramContext) => {
        token.parent = this.context
        if (this.context.type == "Program")
            (this.context.value as ProgramContext[]).push(token)
        else if (this.context.type == "Rule")
            (this.context.value as ProgramContext[]).push(token)
        else if (this.context.type == "ProgramGroup")
            (this.context.value as ProgramContext[]).push(token)
        else if (this.context.type == "ProgramSemiGroup")
            (this.context.value as ProgramContext[]).push(token)
        else if (this.context.type == "ProgramEither")
            (this.context.value as ProgramContext[]).push(token)
        else if (this.context.type == "ProgramFunctionCall")
            (this.context.value as ProgramContext[]).push(token)
    }

    #popContext = () => {
        if (this.context.type == "Rule")
            return (this.context.value as ProgramContext[]).pop()
        else if (this.context.type == "ProgramGroup")
            return (this.context.value as ProgramContext[]).pop()
        else if (this.context.type == "ProgramSemiGroup")
            return (this.context.value as ProgramContext[]).pop()
        else if (this.context.type == "ProgramEither")
            return (this.context.value as ProgramContext[]).pop()
        else if (this.context.type == "ProgramFunctionCall")
            return (this.context.value as ProgramContext[]).pop()
        throw new Error(`Cannot pop value from the current context: ${this.context.type}`)
    }

    visit(term: Visitable) {
        term.accept(this)
    }

    visitMain(term: Assignment) {
        const tokens: object[] = []
        for (let subTerm of term.right) {
            const token = new Visitable(subTerm).accept(this)
            // if(!["AtmostOneQuantifier", "ZeroOrMoreQuantifier"].includes(token.type)) {

            // }

        }
    }

    visitRule(term: Assignment) {
        for (let subTerm of term.right)
            new Visitable(subTerm).accept(this)
    }

    visitAtmostOneQuantifier(term: AtmostOneQuantifier) {
        const value = this.#popContext() as Rule | ProgramFunctionCall | ProgramGroup
        if (value === undefined || !["Rule", "ProgramFunctionCall", "ProgramGroup"].includes(value.type)) {
            return false;
        }

        const token: ProgramAtmostOneQuantifier = { value, type: "ProgramAtmostOneQuantifier" }
        this.#addToContext(token)
        // new Visitable(term.value).accept(this)

        return true
    }

    visitEither(term: Either) {
        const leftContext = this.context as Rule | ProgramFunctionCall | ProgramGroup | ProgramSemiGroup | ProgramEither
        const value: ProgramContext[] = leftContext.value

        const token: ProgramEither = { value, type: "ProgramEither" }
        this.#addToContext(token)

        if(value.length < 1) {
            this.context = token
            return false;
        }

        return true;
    }

    visitFunctionCall(term: FunctionCall) {
        const caller = term.caller
        for(let arg of term.args) {
            // if(this.context.type == "ProgramEither")
                new Visitable(arg).accept(this)
        }
    }

    visitGroup(term: Group) {
        for (let subTerm of term.value)
            new Visitable(subTerm).accept(this)
    }
    visitIdentifier(term: Identifier) {

    }
    visitOneOrMoreQuantifier(term: OneOrMoreQuantifier) {
        new Visitable(term.value).accept(this)
    }
    visitRawValue(term: RawValue) {

    }
    visitSemiGroup(term: SemiGroup) {
        for (let subTerm of term.value)
            new Visitable(subTerm).accept(this)
    }
    visitTopLevel(term: TopLevel) {
        const subterms = term.value.filter(x => x.left.value !== "main")
        for (let subTerm of subterms)
            new Visitable(subTerm).accept(this)
    }
    visitZeroOrMoreQuantifier(term: ZeroOrMoreQuantifier) {
        new Visitable(term.value).accept(this)
    }
}

class Visitable {
    constructor(public token: GrammarToken) { }
    dispatch(visitor: Visitor) {
        switch (this.token.type) {
            case "Assignment":
                return this.token.left.value == "main" ?
                    visitor.visitMain(this.token) : visitor.visitRule(this.token)
            case "AtmostOneQuantifier":
                return visitor.visitAtmostOneQuantifier(this.token)
            case "Either":
                return visitor.visitEither(this.token)
            case "FunctionCall":
                return visitor.visitFunctionCall(this.token)
            case "Group":
                return visitor.visitGroup(this.token)
            case "Identifier":
                return visitor.visitIdentifier(this.token)
            case "OneOrMoreQuantifier":
                return visitor.visitOneOrMoreQuantifier(this.token)
            case "RawValue":
                return visitor.visitRawValue(this.token)
            case "SemiGroup":
                return visitor.visitSemiGroup(this.token)
            case "TopLevel":
                return visitor.visitTopLevel(this.token)
            case "ZeroOrMoreQuantifier":
                return visitor.visitZeroOrMoreQuantifier(this.token)
        }
    }
    accept(visitor: Visitor) {
        return this.dispatch(visitor)
    }
}