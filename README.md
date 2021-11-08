#### Variables, Types, and Operations

```julia
var x :: Int
x = 5

var :: String
y = "hi"


# values

val :: Array
z = [ 4, 5, 6, 7 ]


```

#### Comments

```julia
# single line comment

#=
	multi-line
	comments
=#

```

#### Types
* Maybe<br/>
* Boolean<br/>
* Number:<br/>
	Real:<br/>
		Rational:<br/>
			Bin, Oct, Hex, Exp<br/>
			Int:<br/>
				Int8, Int16, Int32, Int64, Int128,<br/>
			Uint:<br/>
				Uint8, Uint16, Uint32, Uint64, Uint128,<br/>
			Float:<br/>
				Float16, Float32, Float64, Float128,<br/>
			Ufloat:<br/>
				Ufloat16, Ufloat32, Ufloat64, Ufloat128,<br/>
			BigInt,<br/>
			BigFloat<br/>
		Irrational:<br/>
			NaN,<br/>
			Infinites,<br/>
			Infinity,<br/>
	AbstractComplex<br/>
		Complex,<br/>
		Imaginary,<br/>
* AbstractChar:<br/>
	Char,<br/>
	ASCIIChar,<br/>
	UnicodeChar,<br/>
* AbstractString:<br/>
	String,<br/>
	ASCIIString,<br/>
	UnicodeString,<br/>
	Byte,<br/>
	Symbol,<br/>
* URef<br/>
* AbstractExpression:<br/>
	RegExp,<br/>
	GramExp,<br/>
	BinarySyntaxTree,<br/>
* AbstractRange:<br/>
	Range,<br/>
	NumericRange,<br/>
	UnicodeRange,<br/>
* AbstractCollection:<br/>
	Array,<br/>
	Map,<br/>
	Set,<br/>
	Trait,<br/>
	Matrix,<br/>
	Tuple, NamedTuple,<br/>
* AbstractFunction:<br/>
	Function:<br/>
		GenericFunction,<br/>
		UnitFunction,<br/>
		AnonFunction,<br/>
	Constructor,<br/>
	Generator,<br/>
	Macro<br/>
* Object<br/>

```julia
var q = "hello"
var r = 0
var s = true
```
#### Maybe - type :: Maybe
```julia
val m :: Maybe(Int) = ['a', 'b', 'c'].indexOf('b')
print(m)
# NullException: failed to resolve Maybe value
print(m || NaN) # 2
# same as
print(m ?? x -> NaN) # 2

type(2 + 3) # type :: Int64

type.is(type :: String, "abc") # true
```

#### Integers - type :: Int

* ranges from Int8 to Int128
* also
* ranges from Uint8 to Uint128

```julia
var :: Int16
i16 = -123

var :: Uint16
ui16 = 123

type.max(type :: Int)
# 9223372036854775807

type.min(type :: Int)
# -9223372036854775807
```

##### formats
* 5cffa!x - hex
* 127!o - octal
* 10011!b - binary

#### Arbitrary Precision Integers

```julia
var :: BigInt
bInt1 = BigInt(1234)

var :: BigInt
bInt2 = 1234!n
```

#### Floats - type :: Float

* Floating point numbers follow the IEEE 754 standard
* ranges from Float16 to Float128
* also
* ranges from Ufloat16 to Ufloat128

```julia
var :: Float16
f16 = -123.456

var :: Ufloat16
uf16 = 123.456
```

#### Arbitrary Precision Floats

```julia
var :: BigFloat
bFlt1 = BigFloat(1234.543)

var :: BigFloat
bFlt2 = 1234.543!n
```

**Infinity** and **-Infinity** for infinity, **NaN** is used for "not a number" and **Nil** expressions the absence of a Number

##### Elementary mathematical functions and operations

```julia
Math.round(123.7568) # 124
Math.sqrt(4) # 2
Math.cbrt(9) # 3
Math.exp(1) # 1
Math.log(10) # 1
Math.sin(60) # 0.567
Math.cos(30) # 0.345
Math.tan(0) # 1
# and many more...
```

#### Chained assignments

```julia
var a, b, c, d
a = b = c = d = 1

a = 1; b = 2; c = 3; d = 4

(a, b) = (b, a) # now a is 2 and b is 1

c = [ 0, 1, 2, 3, 4 ]
[ a, b ] = c

c = { 0, 1, 2, 3, 4 }
{ a, b } = c

c = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4 }
{ a, b } = c
# { a: 'a', b: 'b' } = c
```

#### Boolean operators

```julia
var t = true
var f = false

t && t # true
t || f # true
!t # false
```

#### Rational and complex numbers

##### Complex numbers

```julia
3 + 5!im
0 - 2!im
-1 + 0!im
```

It is a parametric type
```julia
type(3 + 5!im) # type :: Complex(Int64, Int64)
```

also
```julia
cp = Complex(3, 5) # 3 + 5!im
cp.real # 3
cp.imag # 5
```

#### Rational numbers

```julia
3//4
1//2
1//4
 
type(1//2) # type :: Rational(Int64, Int64)
 
# also
ra = Rational(1, 2) # 1//2

ra.numer # 1
ra.denom # 2
```

#### Characters

```julia
\a == 'a'
\b == 'b'
\c == 'c'
type(\a) # type :: Char
# ranges from 0!cx to ffffffff!cx
```

#### Strings

```julia
"Hi"
\greet

"""
	multiline double quote string
"""
```

Literal strings are always ASCII (if they only contain ASCII letters) or UTF8 (if they contain characters that cannot be represented in ASCII)

```julia
type("hello")
# type :: ASCIIString

type("Güdrun")
# type :: UTF8String

str = "Cliver"
str[3 to 5] # ive

greet = "hello"
world = "earth"
strIntrop = f"$greet {world + '!'}"

greet + " " + world # hello world
"hello" " " "world" # hello world
```

#### Symbols

```julia
\hello
\hi
```

#### URef

```julia
U\hello
U\hi
```

#### Formatting numbers and strings

```julia
name = "Pascal"

fmt@(name) "Hello, %s \n"
# returns Hello, Pascal

# d for integers
fmt@(1!e ^ 5) "%d\n" # 100000

	
# f = float format, rounded if needed
fmt@(7.35679) "x = %0.3f\n" # 7.357

# or to create another string
str = fmt@(7.35679) "%0.3f" # 7.357


# e = scientific format with e
fmt@(7.35679) "%0.6e\n" # 7.356790e+00

# c = for characters
fmt@('α') "output: %c\n" # output α

# s for strings
fmt@("I like Cliver") "%s\n"

# right justify
fmt@("text right justified!") "%50s\n"

```

#### Regular Expressions

```julia
regexp = re"(h | y) ellow?".flags("gimsx")
regexp("hello").isMatch # true
regexp("yellow").isMatch # true
```

#### Gramatic Expressions

```julia
x = 124
gramexp = gr"""
	-- this is a comment
	$ignore _space
	$import "x"
	$consider _case -- case sensitive
	addition ::= NUMBER PLUS NUMBER
	PLUS ::= "+"
	NUMBER ::= \-? \d+ (\.\d+)? | (\-? \d+)? \.\d+
	$return addition
""".flags("ims")
gramexp(expr :: (1 + 2)).isMatch # true
gramexp("1 + 2").isMatch # true
```

#### Ranges and Arrays

```julia
var :: Range
ra = (1, 2) to 20

var :: Range(Number)
nra = 2 to 20

var :: Range(Char)
cra = \a to \z

ra = (1, 2) to 10

ra = 1 to 10 # same as (1, 2) to 10

ra = 1 to Infinity # same as (1, 2) to Infinity
# same as (1 ; step: 1) to Infinity

```

#### Array

```julia
var :: Array(Int ;; length: 4)
arr = [1, 2, 3, 4]

arr[1] # 1
# arr.1

# i.e, in Cliver arrays start indexing from 1

arr.length # 4

arr[1 to 3] # [1, 2, 3]

arr[5] = 5 # 5

```

**There is also:**<br/>
```julia 
Array.drop(index) # drop any index
Array.first() # drops first index
Array.last() # drops last index
	
Array.add(index, item) # add at any index
Array.first(item) # adds at first index
Array.last(item) # adds at last index
```

The above are all immutable methods and
they return a new array. Their equivalent
mutating method are also available postfixed
with "!"

#### Map, Filter and Array Comprehensions

```julia
var :: Array(Int)
primes = [2, 3, 5, 7, 11]

primes.map(x -> x * 2) # [4, 6, 10, 14, 22]
# same as

primes.map(fun(x)) do
	x * 2
end

primes.filter(x -> x %2 == 0) # [2]

[ for x in 1 to 10: x ]
# [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
```

#### Other Collection Types

#### Set

```julia
# Set

var :: Set(Int)
set = { 1, 2, 3, 4 }

set[1] # 1
# set.1

2 in set # true

```

#### Map

```julia
var :: Map(Int | String: String)
map = {
	\wow: "how",
	"hello": "hai",
	5: "bye",
	Pair(3, "lie")
}

5 in map # false
# means Pair(5, 5) which isn't present
Pair(5, _) in map # true
Pair(5, "bye") in map # true

# key: value is syntactic sugar for Pair(key, value)

map["hello"] # "hai"


```

#### Trait

```julia
var :: Trait({
	fun :: Int -> Int
	fun :: (Int, Int) -> Int
	fun :: ...Int -> Int
})

trait = @Trait {
	a -> a,
	(b, c) -> a * b,
	(...d) -> (+)(...d),
}

trait(1) # 1
trait(1, 2) # 2
trait(1, 2, 3) # 6

trait.add({
	"c" -> print("closed")
})

(type :: Infer -> Infer) in trait # true

```

#### Matrix

```julia
var :: Matrix(val :: 3//3, Int)
matrix = [
	1, 2, 3;
	4, 5, 6;
	7, 8, 9;
]

matrix[1//2] # 2
```

#### Tuple

```julia
var :: Tuple(Int, String, Boolean, Float)
tuple1 = val(1, "hi", true, 4.5)

tuple1[1] # 1
# tuple1.1
```

#### NamedTuple

```julia
var :: NamedTuple(Int, String, Boolean)
tuple2 = var(a, b, c)

var tuple3 = tuple2(1, "hi", true)
```

#### Dates and Times

```julia
var initial = Time.elapsed()
# --------------------------
# long computation
# ---------------------------
var final = Time.elapsed()
var time_elapsed = final - initial
print(f"Time elapsed: $time_elapsed")

Time.now() # "10:30:67 22/08/2014"
Time.getFullTime() # 10:30:67
Time.hour # 10
Time.minute # 30
Time.second # 67
Time.getFullDate() # 22/08/2014
Time.day # 22
Time.month # 08
Time.year # 2014

Time.sleep(500)
Time.setImmediate(fun) do  smt() end
Time.setInterval(1000, fun) do  smt() end
Time.setTimeout(2000, fun) do  smt() end
```

#### Functions

#### Defining functions

```julia
fun :: String -> Infer
greet(name)
	print("hello " + name)
end

fun greet(name): print("hello " + name)

@call
fun greet()
	print("greetings!")
end

call@(99)
fun(age)
	age + 1
end
```

#### Optional and Keyword Arguments

```julia
fun :: (Int, Int) -> Int
add(a, b: 10): a + b

fun :: (Int, Int ; Int, Int) -> Int
add(a, b: 10; c, d: 2):
	(a + b) - (c * d)

fun :: (String+ ; String+) -> IO
add(...args; ...opt_args): print(args, opt_args)
```

#### Anonymous Functions

```julia
fun(x): print(x)

# same as
fun(x, y)
	print(x)
	print(y)
end

```

#### UnitFunctions

```julia
() -> print("hello")

x -> print(x)

x -> do
	print(x * 2)
	print(x * 3)
end

```

#### IIFE

```julia
(x -> print(x))("hello") # hello
# same as

call@("hello")
x -> print(x) # hello


(fun(x): print(x))("hello")
# same as

call@("hello")
fun(x): print(x) # hello

@call
fun greet()
	print("greetings")
end

```

#### Pipeline Operator

```julia
var pipeline = 5
	`` square
	`` root
	`` power(val, ?)
	`` x -> sin(x)
	`` x -> (1 + x)
	?? e -> print(e)

# same as

pipeline = 5 as arg
	`` square(arg)
	`` root(arg)
	`` power(val, arg)
	`` sin(arg)
	`` 1 + arg
	?? e -> print(e)

```

#### Error Dejection Operator

```julia
fun err(e): type(e)

var file = await FileSys.File("file-name.txt") ?? err

var fileContent = await file.read() ?? err
print(await fileContent)

# same as

file = try:
		await FileSys.File("file-name.txt")
	catch e: err(e)

fileContent = try:
		await file.read()
	catch e: err(e)

print(await fileContent)

```

#### Generic Functions and Multiple Dispatch

```julia
fun greet(): print("hello")

fun greet(name): print("hi ", name)

fun greet(name, age):
	print("hi ", age, " year old ", name)

fun :: (Number, Number) -> Number
add(num1, num2): num1 + num2

fun :: (Number, String) -> Number
add(num1, str1):
	num1 + parse(type :: Int, str1)

```

#### Generators

```julia
fun :: Generator(() -> String, Char -> Int)
generate<yield>()
	print(fun.sent) # 'a'
	yield 10
	
	print(fun.sent) # 'b'
	yield 20
	
	print(fun.sent) # 'c'
	yield 30
	
	print(fun.sent) # 'd'
	yield 40
	
	print(fun.sent) # 'e'
	return "string value"
end

generate()
	..next('a') # 10
	..next('b') # 20
	..next('c') # 30
	..next('d') # 40
	..next('e') # "string value"
	..next('f') # (end)
# when done, it returns the (end) operator

for n in generate():	print(n)
```

#### Object Oriented Programming

#### Constructor Functions

```julia
fun :: Constructor((String, String, String) -> Object(Human, Mammal, Student))

Person<self>(var name, _age, _address)
	
	# var name / val name
	# same as
	# self.name = name
	# and
	# _age
	# same as
	# self._age = _age
	
	self.date = Time.now()
	Person.mindset = "neutral"
	
	self.id = 123ffce!x
	
	self
		..include(Human, (125, "hi"); pick: {\goodBehaviours, \humour_sense})
		..include(Mammal, (215, "bye"); omit: {\laziness})
		# args - Ctor, CtorArgs; only, leave

	var S = self.include(Student, (512, "yay"))
	
	@@where
	
	var job = "programmer"
	
	var lives_in = "India"
	
	fun greet(word)
		print(f"$word from {self.name}")
	end
	
	fun farewell(word)
		print(f"$word from {self.name}")
	end
	
	fun salary<accessor>(default: 3000)
		@@where
		fun get(value)
			value -= 5
		end
		fun set(value)
			if value < 50 ^ 10
				value
			else
				throw BoundError("")
			end
		end
	end
	
	onevent@(\delete)
	fun _handleDeletion(evt)
		# event handler logic
	end
	
	fun _macc<meta>()
		# macro definition
	end
end

fun Person<static>()
	# destructor logic
	@@where
	var mindset = "positive"

	fun getMood()
		if mindset == "positive"
			print("happy")
		elseif mindset == "neutral"
			print("pleasant")
		else
			print("sad")
		end
	end

end
```

#### AsyncFunction

```julia
fun :: AsyncFunction(String -> String)
@async sayHello(word)
	var name = FileSystem.File("/file.txt").read()
	var greet = await name + word
	return await greet
end
```

#### Object

```julia
var :: Object(Person)
person = Person("John", 100, ["a", "bb", "ccc"])

person.greet("hello") # hello from John
person.getMood() # pleasant
Person.getMood() # happy

print(person.salary) # 30000
person.salary = 40000
print(person.salary) # 40000
```

#### Cascade Notation

```julia
person
	..name = "Jack" # Jack
	..greet("hello") # hello from Jack
	..getMood() # pleasant
```

#### Object Literal

```julia
var obj = @Object {
	var color = "red"
	fun fill()
		# implementation logic
	end
	fun stroke()
		# implementation logic
	end
}

type(obj) # type :: Object
```

#### Control Flow

#### Conditional Evaluation

```julia
var num = 7

if num > 10
	print("greater")
elseif num < 10
	print("lesser")
else
	print("equals")
end

# same as

num = 7
if num > 10
	print("greater")
elseif num < 10
	print("lesser")
else
	print("equals")
end
	
var sign = if num >= 0: 1 else: -1

var x = 7
var y = case x
	1: "sunday"
	2: "monday"
	3: "tuesday"
	4: "wednesday"
	5: "thursday"
	6: "friday"
	7: "saturday"
	8 | 9 | 10: "hello Martian!"
	_: "invalid"
end


print(y) # "saturday"

```

#### The For loop

```julia
x = 1
for x < 100
	print(x)
end

for x < 100
	print(x)
done s
	print(x ^ 2)
end

for(x = 1; x < 10; x += 1)
	print(x)
end

arr = [1, 2, 3, 4, 5, 6, 7]
for [k, v] in arr.pairs
	print(v)
end

for v in 1 to 10
	print(v)
end

# same as

for v in 1 to 10: print(v)
```

#### The break and continue statements

```julia
for x <= 100
	if x % 5 == 0
		continue
	elseif x == 77
		break
	else:
		print(x ^ 2)
end
```

#### Exception Handling

```julia
var codes = ["AO", "ZD", "SG", "EZ"]
if code in codes
	print(f"This is an acceptable $code")
else
	throw DomainError()
end

var a = []
try
	a.drop!()
catch ex :: DomainError
	print(type(ex))
catch ex :: IndexError | RangeError
	print(type(ex))
catch ex
	print(type(ex))
done s
	print("finished")
end

```

#### More on Types, Methods & Modules

#### Type Signatures and Conversions

```julia
var :: Int16
a = 16

var :: String
b = "hello"

# same as
var c :: String = "125"

"125" :: Int # 125
```

#### Type Conversions and Promotions

```julia
type.parse(type :: Int16, 12) # 12
type.parse(type :: Int32, "121") # 121

type.promote(1, 2.5, 3//4) # 1.0, 2.5, 0.75
type.promote(1.5, 1!im) # 1.5 + 0.0!im, 0.0 + 1.0!im

type.promote(true, \c, 1.0) # 1.0, 99.0, 1.0
```

#### The type hierarchy – subtypes and supertypes

```julia
type(type :: Int64) # type :: Signed

type(type :: Signed) # type :: Integer

type(type :: Integer) # type :: Real

type(type :: Real) # type :: Number

type(type :: Number) # type :: Any

type(type :: Any) # type :: DataType

type.subs(type :: Integer)
# type :: Any(BigInt, Bool, Char, Signed, Unsigned)

type.subs(type :: Signed)
# type :: Any(Int128, Int16, Int32, Int64, Int8)

type.subs(type :: Int64)
# type :: Null
```

#### Concrete and Abstract Types

Concrete types have no subtypes and might only have abstract types as their supertypes.

An abstract type (such as Number and Real) is only a name that groups multiple subtypes together, but it can be used as a type annotation or used as a type in array literals.

#### User Defined and Composite Types

```julia
type Cardinal :: DataType
type Point :: Cardinal
type Point(Float64, Float64, Float64)

var p(f1, f2, f3) :: Point

var b = p(1, 2, 3)
# same as
# val b(1, 2, 3) :: Point

b.f1 # 1
b.f2 # 2
b.f3 # 3
```

#### When are two values or objects equal or identical?

```julia
var i16 = 125 :: Int16
var i64 = 125 :: Int64 # default
var d = { 'a': 100, 'b': 200, 'c': 300 }

i16 == i64 # true
i16 is i64 # false
i16 is! i64 # true

var a = 50

Pair(\a) in d # false
# same as Pair(\a, a) in d
Pair(_, 100) in d # true
Pair(\a, _) in d # true
Pair(\a, 100) in d # true

Pair(\a) in! d # true
# same as Pair(\a, a) in! d
Pair(_, 100) in! d # false
Pair(\a, _) in! d # false
Pair(\a, 100) in! d # false
```

#### Metaprogramming

#### Expressions and Symbols

```julia
expr :: (1 + 2)
expr :: do
	var a = 5
	var b = 2
	a + b
end
```

#### Eval and Interpolation

```julia
var e1 = Expr(\call, ((*), 3, 4))
 # expr :: ((*)(3, 4))


var a = 4
expr :: do
	var b = 1
	var e5 = expr :: a + b
end # expr :: 4 + b
```

#### Defining Macros

Macro takes the input expressions and returns the modified expressions at parse time

```julia
fun macint<meta>()
	expr :: do
		print("start")
		${ meta.eval() }
		print("after")
	end
end

@macint print("Where am I?")
#=
start
Where am I?
after
=#
```

#### I/O, Networking, and Parallel Computing

#### Basic input and output

#### Channels

```julia
var :: Channel(String)
chan1 = Channel(\server; default: "", capacity: 4)
# a channel can be a
# \sender, \receiver or \server
# \server is the default

chan1.capacity # 4
chan1.queued # 0

@async
fun channeler1(ch)
	print(~ch)
end

await channeler1(chan1)
chan1 <~ "hello world!"
# prints "hello world!"

chan1.close()

@async
fun channeler2(ch)
	for(v = 1; v <= 4; v +=1)
		ch <~ "hello world!"
	end
	ch.close()
end

var chan2 = Channel()

await channeler2(chan2)

for true
    var res = ~chan1
	if res is (end)
		print("Channel Closed")
		break
	end
    print("Channel Open: ", res)
end

var chan3 = Channel(capacity: 4)

@async do
	chan3 <~ "first"
	chan3 <~ "second"
	chan3 <~ "third"
	chan3 <~ "fourth"
	chan3.close()
end

for res in chan3:	print(res)

```

* Cliver IO is stream-oriented
* Stream is the Fundamental Stream Type
* IO is its subtype

```julia
var stream = IO.stdin
for line in stream.lines:
	print(f"Found $line")

var file = FileSys.File("example.dat")

for line in file.lines
	print(line)
done m
	file.close()
end
```

#### TCP Sockets and Servers

```julia
var server = HTTP.serve({ \port: 8080 })

@async
for req in server
	req.respond({ \body: 'Hello World\n' })
end
```

#### Parallel Operations and Computing

```julia
for pid in workers()
	# do something with each process (pid = process id)

end

@parallel
for i in 1 to 100000
	arr[i] = i
end
```

#### Running External Programs

#### Running Shell Commands

```julia
Shell.pwd() # "c://test"
Shell.cd("c://test//week1")
Shell.ls()

var cmd = "echo Cliver is clever"
Shell.run(cmd) # returns Cliver is clever

Shell.run("date")
# Sun Oct 12 09:44:50 GMT 2014

cmd = r"cat file1.txt" # raw string

Shell.run(cmd)
# prints the contents of file1.txt
```

#### Calling C and FORTRAN

```julia
var lang = FFI.C(val(\getenv, "libc"), type :: Ptr(Uint8), val(type :: Ptr(Uint8)), "LANGUAGE")
```

FFI - Foreign Function Interface
In general, C function takes the following arguments:

	A (\function, "library") tuple with the name of the C function (here, getenv) is used as a symbol, and the library name (here, libc) as a string
	The return type (here, type :: Ptr(Uint8)), which can be any bitstype, or type :: Ptr

	A tuple of types of the input arguments (here, (type :: Ptr(Uint8)), note the tuple)

	The actual arguments if there are any (here, "LANGUAGE")
=#

#### Calling Python

```julia
FFI.Python.eval("10*10") # 100

@FFI.pyimport "math"
math.sin(math.pi / 2) # 1.0
```

#### Calling JavaScript

```julia
FFI.JavaScript.eval("10*10") # 100
FFI.JavaScript.eval("Math.PI * 2") # 6.2857
```
