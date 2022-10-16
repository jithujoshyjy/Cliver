### Comments

Single line comments in Cliver start with `#` and multiline comments are enclosed within `#= =#` pairs.

### Import/Export

Cliver import syntax is inspired by JavaScript and TypeScript.
Any identifier prefixed with underscore (_) is considered private and cannot be imported.
All other identifiers are exported implicitely.

```julia
# import module for it's side effect
import Package\Module
import "./filename.cli"

# import all into current scope
import ... from Package\Module
import ... from "./filename.cli"

# import all as a namespace
import ...Abc from Package\Module
import ...Abc from "./filename.cli"

# import specific things
import A, B from Package\Module
import A, B from "./filename.cli"

# import as identifier syntax
import A as B from Package\Module
import A as B from "./filename.cli"
```

### Variables and Constants

variables are declared with the **var** keyword and constants by the **val** keyword. Semicolons are optional in Cliver.

```julia
# without initial value
var x;

# with initial value
var x = value
val y = value
```

```julia
# with type annotation
var x :: Type = value
val y :: Type = value

# with type signature
var :: Type
x = value

val :: Type
y = value
```

### Type Declaration

There are a whole bunch of standard types and the type system is flexible enought to let you define your own types.

```julia
# type alias
type NewType = ExistingType

# type constructor without parameters
type TypeCtor() = DataCtorA | DataCtorB
```
Type constructors can take parameters; the parameter can be a generic type, an abstract type or a concrete type.
If the parameter is not annotated with a type, then it is considered generic.
If the parameter is abstract, the parameter value should be a subtype of the specified type.
If it's a concrete type, the parameter value should be a literal value of that type.
```julia
# type constructor with parameters
type TypeCtor(a, b :: AbstractType, c :: ConcreteType) = a | DataCtorA | DataCtorB(c, b)
```

#### Abstract and Concrete types

Abstract types have no values associated with them they are merely there for building the type hierarchy.
But however they can have a structural type definition.
An abstract type can inherit from other abstarct type.
Subtyping is only possible with Abstract types. The root abstract type is the DataType.
Concrete types have one or more data constructors associated with them. All data constructors are publically accessable values.
```julia
# abstract type decalration
type AbstractCtor() :: DataType

# concrete type declaration
type ConcreteCtor() :: AbstractType = DataCtorA | DataCtorB
```

#### Type Constraints

type constraints follow the same rules as type constructor parameters.

```julia
type ConcreteCtor() = Type a => DataCtorA | DataCtorB(a)
```

#### Structural Typing

Structural typing defines the object structure of a type. structural types are only possible with abstract types.
They can have value assertion to check whether the value associated with the type meets certain conditions.

```julia
type AbstractCtor() :: DataType = {
    propertyA :: Type,
    methodB :: Type
}

# with value assertions
type AbstractCtor() :: DataType = {
    value -> boolean_expression,
    propertyA :: Type,
    methodB :: Type
}
```

### Object Oriented Programming

There are no classes in Cliver instead there are Constructor functions.

```julia
fun CtorFunction<self>(argA, argB)

    # constructor logic...

    @@where

    val propA = value
    fun methodB()
        # ...
    end
end
```

#### Accessors

Accessors, i.e getters and setters are special functions.

```julia

fun CtorFunction<self>()
    
    fun GetVal<getter>()
        # getter logic
    end

    fun SetVal<setter>(value)
        # setter logic
    end
end
```

#### Composition in Constructors

In Constructor functions, composition is done through import statements.
Cliver doesn't support inheritance in it's OO design.

```julia

type AType = Constructor().{ aProp :: Type }
type BType = Constructor().{ ...Object(AType), bProp :: Type }

fun :: AType
A<self>()
    # ...
    val aProp = value
end

fun :: BType
B<self>()
    # ...
    @@where
    import ... from A()
    val bProp = value
end
```

#### Static Constructors

The methods and properties of a static constructor is bound to the constructor rather than to the constructed objects.

```julia

fun CtorFunction<static>()
    # static constructor logic...

    @@where

    val propA = value
    fun methodB()
        # ...
    end
end
```

#### Objects

objects are similar to any other programming language. They are created by Constructor functions.

```julia
CtorFunctionA()
CtorFunctionB()
```

##### Object extend notation

You can create a new object containing the intrinsics of another one.

```julia
# creating a new object from the StaticConstructor Object
val objA = Object.{
    var propA = value
    fun methodA()
    end
}

val objB = objA.{
    var propB = value
    fun methodB()
    end
}
```

##### Object Cascade Notation

The cascade notation is a syntatic form of the Builder design pattern.

```julia
objB()
    ..propA = value
    ..methodB()
    ..methodA()
```

### Control Structures

#### Conditionals

There are two types of conditionals in Cliver; if conditional and match expression.

##### If Conditional
There exists 3 syntatic variants of this construct.

```julia
# If statements - variant1

if condition
    # ...
end

if condition
    # ...
else
    # ...
end

if condition
    # ...
elseif condition
    # ...
end

if condition
    # ...
elseif condition
    # ...
else
    # ...
end
```

```julia
# If statements - variant2

if condition:
    expression

if condition
    # ...
else:
    expression

if condition
    # ...
elseif condition:
    expression

if condition
    # ...
elseif condition
    # ...
else:
    expression
```

The third variant is the if...else expression

```julia
print(if condition: expression else: expression)
```

##### Match Expression

Match expression is the pattern matching construct in Cliver.

```julia
val value = match expression
    case pattern:
        expression
    case pattern:
        expression
    case _:
        expression
```

#### Loops - the for loop

There exists only one looping construct in Cliver. It has atleast 6 variants.
The statement form of the for loop comes with a done block. It will execute when the loop ends.
The status of loop after execution can be on of:
1. "broke" - the loop was terminated with a break clause,
2. "completed" - the looping was completed successfully and it ran atleast once,
3. "never" - the loop never ran.

```julia
# for statements

for item in iterable
    # ...
end

for item in iterable
    # ...
done status
    # ...
end

for item in iterable
    # ...
done status:
    expression

# traditional C-style syntax
for(i = 1; i < x; i += 1)
    # ...
end

# syntatic equivalent of while loop
for condition
    # ...
end
```

There exists a **for** expression which returns an iterator and can be used in arrays and other data structures.

```julia
val arr = [for item in iterable: item]
```

**break** and **continue** are used to alter the execution of the loop and are only available within the for statement.

#### Error Handling Constructs

There two main error handling constructs in Cliver and it is the try...catch and error pipeline operator.

##### Try-Catch construct
It is used for both block level and inline error handling.
The statement form of the try...catch construct comes with a done block.
It will execute after the execution of all try and catch blocks, regardless of the error.
The status of error handling can be one of three:
1. "caught" - there was an error and it was caught by a catch block,
2. "uncaught" - the error was not caught or an uncaught error was thrown,
3. "success" - the code ran without producing an error.
```julia
try
    # ...
catch e :: Type
    # ...
end

try
    # ...
catch e :: Type:
    expression

try
    # ...
catch e :: Type
    # ...
done status
    # ...
end

try
    # ...
catch e :: Type
    # ...
done status:
    expression
```

There exists a **try-catch** expression which handles inline errors or handles errors thrown at the expression level. This form doesn't support annotation of the error parameter.

```julia
val someVal = try: expression catch e: expression
```

##### Error Pipeline Operator

The error pipeline operator functions identically to the try-catch expression except it can also be used in function pipelines.
```julia
val someVal = expression ?? callback
```

