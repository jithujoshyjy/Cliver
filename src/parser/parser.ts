import { TokenType, type TokenStream } from "../lexer/token.js";
import { grammaticParse } from "./grammarParser.js";
import { readFile } from "fs/promises";

export async function generateAST(tokens: TokenStream): Promise<any> {
    console.log();
    
    const grammerPath = new URL('../../', import.meta.url).pathname + "grammar.txt"
    const grammar = await readFile(grammerPath, "utf-8")

    console.log(grammaticParse(grammar, tokens))

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
