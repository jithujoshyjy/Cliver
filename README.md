#### Variables, Types, and Operations

```
var x :: Int
x = 5

var :: String
y = "hi"


# values

val :: Array
z = [ 4, 5, 6, 7 ]


```

#### Comments

```
# single line comment

#=
	multi-line
	comments
=#

```

#### Types

* Null
* Boolean
* Number:
    * NaN,
    * Nil,
    * Infinity,
    * Bin, Oct, Hex, Exp
* Int:
    * Int8, Int16, Int32, Int64, Int128,
* Uint:
    * Uint8, Uint16, Uint32, Uint64, Uint128,
* Float:
    * Float16, Float32, Float64, Float128,
* Ufloat:
    * Ufloat16, Ufloat32, Ufloat64, Ufloat128,
    * Complex,
    * BigInt,
    * BigFloat
* Char:
    * GenericChar,
    * ASCIIChar,
    * UnicodeChar,
* String:
    * GenericString,
    * ASCIIString,
    * UnicodeString,
    * Byte,
    * Symbol,
    * URef,
    * RegExp,
    * GramExp
* Range
* Collection:
    * Array,
    * Map,
    * Set, 
    * Trait,
    * Matrix,
    * Tuple, NamedTuple,
* Function:
    * Constructor,
    * Generator,
    * AsyncFunction,
    * GenericFunction,
    * UnitFunction,
    * AnonFunction,
* Object

```
var q = "hello"
var r = 0
var s = true

type(2 + 3) # type :: Int64

type.is(type :: String, "abc") # true
```

#### Integers - type :: Int

* ranges from Int8 to Int128
* also
* ranges from Uint8 to Uint128

```
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

```
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

```
var :: Float16
f16 = -123.456

var :: Ufloat16
uf16 = 123.456
```

#### Arbitrary Precision Floats

```
var :: BigFloat
bFlt1 = BigFloat(1234.543)

var :: BigFloat
bFlt2 = 1234.543!n
```

**Infinity** and **-Infinity** for infinity, **NaN** is used for "not a number" and **Nil** expressions the absence of a Number

##### Elementary mathematical functions and operations

```
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

```
var a, b, c, d
a = b = c = d = 1

a = 1; b = 2; c = 3; d = 4

a, b = b, a # now a is 2 and b is 1
```

#### Boolean operators

```
var t = true
var f = false

t && t # true
t || f # true
!t # false
```

#### Rational and complex numbers

##### Complex numbers

```
3 + 5!im
0 - 2!im
-1 + 0!im
```

It is a parametric type
```
type(3 + 5!im) # type :: Complex(Int64, Int64)
```

also
```
cp = Complex(3, 5) # 3 + 5!im
cp.real # 3
cp.imag # 5
```

#### Rational numbers

```
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

```
\a == \'a'
\b == \'b'
\c == \'c'
type(\a) # type :: Char
# ranges from 0!cx to ffffffff!cx	
```

#### Strings

```
"Hi"
'Hello'
\greet

"""
	multiline double quote string
"""

'''
	multiline single quote string
'''
```

Literal strings are always ASCII (if they only contain ASCII letters) or UTF8 (if they contain characters that cannot be represented in ASCII)

```
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

```
\hello
\hi
```

#### URef

```
U\hello
U\hi
```

#### Formatting numbers and strings

```
name = "Pascal"

@printf("Hello, %s \n") name
# returns Hello, Pascal

# d for integers
@printf("%d\n") 1!e ^ 5 # 100000
	
# f = float format, rounded if needed
@printf("x = %0.3f\n") 7.35679 # 7.357

# or to create another string
str = @printf("%0.3f") 7.35679 # 7.357


# e = scientific format with e
@printf("%0.6e\n") 7.35679 # 7.356790e+00

# c = for characters
@printf("output: %c\n") \'α' # output α

# s for strings
@printf("%s\n") "I like Cliver"

# right justify
@printf("%50s\n") "text right justified!"

```

#### Regular Expressions

```
regexp = re"(h | y) ellow?".flags("gimsx")
regexp("hello").isMatch # true
regexp("yellow").isMatch # true
```

#### Gramatic Expressions

```
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

```
var :: Range
ra = (1, 2) to 20

var :: Range(Number)
nra = 2 to 20

var :: Range(Char)
cra = \a to \z

ra = (1, 2) to 10

ra = 1 to 10 # same as (1, 1) to 10

ra = 1 to Infinity # same as (1, 1) to Infinity

```

#### Array

```
var :: Array(val :: 4, Int)
arr = [1, 2, 3, 4]

arr[1] # 1

# i.e, in Cliver arrays start indexing from 1

arr.length # 4

arr[1 to 3] # [1, 2, 3]

arr[5] = 5 # 5
```

**There is also:**<br/>
``` 
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

```
var :: Array(Int)
primes = [2, 3, 5, 7, 11]

primes.map(x -> x * 2) # [4, 6, 10, 14, 22]
# same as
primes.map() <| fun(x): x * 2

primes.filter(x -> x %2 == 0) # [2]

[ for x in 1 to 10: x ]
# [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
```

#### Other Collection Types

#### Set

```
var :: Set(Int)
set = { 1, 2, 3, 4 }

set[1] # 1
```

#### Map

```
var :: Map(Int | String: String)
map = {
	\wow: "how",
	"hello": "hai",
	5: "bye",
	Pair(3, "lie")
}

# key: value is syntactic sugar for Pair(key, value)

map["hello"] # "hai"
```

#### Trait

```
var :: Trait({
	fun :: val :: 0 -> Error
	fun :: Int -> Int
	fun :: (Int, Int) -> Int
	fun :: Int+ -> Int
})

trait = @Trait {
	0 -> throw Error("Invalid"),
	a -> a,
	(b, c) -> a * b,
	(...d) -> (+)(...d)
}

trait(1) # 1
trait(1, 2) # 2
trait(1, 2, 3) # 6

trait.insert({
	"c" -> print("closed")
})
```

#### Matrix

```
var :: Matrix(val :: 3//3, Int)
matrix = [
	1, 2, 3;
	4, 5, 6;
	7, 8, 9;
]

matrix[1//2] # 2
```

#### Tuple

```
var :: Tuple(Int)
tuple1 = val(1, 2, 3, 4)

tuple1[1] # 1
```

#### NamedTuple

```
var :: NamedTuple(Int)
tuple2 = var(a, b, c)

var tuple3 = tuple2(1, 2, 3)
```

#### Dates and Times

```
var initial = Time.elapsed()
# --------------------------
# long computation
# ---------------------------
var final = Time.elapsed()
var time_elapsed = final - initial
print("Time elapsed: $time_elapsed")

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
Time.setImmediate() <- fun() end
Time.setInterval(1000) <- fun() end
Time.setTimeout(2000) <- fun() end
```

#### Functions

#### Defining functions

```
fun :: String -> Infer
greet(name)
	print("hello " + name)
end

fun greet(name): print("hello " + name)

@call
fun greet()
	print("greetings!")
end

@call(99)
fun(age)
	age + 1
end
```

#### Optional and Keyword Arguments

```
fun :: (Int, Int) -> Int
add(a, b: 10): a + b

fun :: (Int, Int ; Int, Int) -> Int
add(a, b: 10; c, d: 2):
	(a + b) - (c * d)

fun :: (String+ ; String+) -> IO
add(...args; ...opt_args): print(args, opt_args)
```

#### Anonymous Functions

```
fun(x): print(x)

# same as
fun(x, y)
	print(x)
	print(y)
end

```

#### UnitFunctions

```
() -> print("hello")

x -> print(x)

x -> do
	print(x * 2)
	print(x * 3)
end

```

#### IIFE

```
(x -> print(x))("hello") # hello
# same as

@call("hello")
x -> print(x) # hello


(fun(x): print(x))("hello")
# same as

@call("hello")
fun(x): print(x) # hello

@call
fun greet()
	print("greetings")
end

```

#### Pipeline Operator

```
pipeline = 5
	`` square
	`` double
	`` root
	`` x -> power(x, 4)
	`` sin

```

#### Error Dejection Operator

```
fun err(e): type(e)

var file = await FileSystem.File("file-name.txt") |< err
var fileContent = await file.read() |< err
print(await fileContent)

# same as

file = try:
		await FileSystem.File("file-name.txt")
	catch e: err(e)
fileContent = try:
		await file.read()
	catch e: err(e)
print(await fileContent)

```

#### Generic Functions and Multiple Dispatch

```
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

```
fun :: Generator((String, Int) -> Infer)
generate()
	yield 10
	yield 20
	yield 30
	yield 40
	return "string value"
end

generate()
	..next() # 10
	..next() # 20
	..next() # 30
	..next() # 40
	..next() # "string value"
	..next() # (end)
# when done, it returns the (end) operator

for n in generate():	print(n)
```

#### Object Oriented Programming

#### Constructor Functions

```
fun :: Constructor((String, String, String) -> Object(Human, Mammal, Student))

Person self, var(name, _age, _address)
	
	self.name = name
	self.date = Time.now()
	Person.mindset = "neutral"
	
	val self.id = 123ffce!x
	
	self
		..include(Human, 125, "hi")
		..include(Mammal, 215, "bye")

	var S = self.include(Student, 512, "yay")
	
	return self
	
	var job = "programmer"
	
	var lives_in = "India"
	
	fun greet(word)
		print(f"$word from {self.name}")
	end
	
	fun farewell(word)
		print(f"$word from {self.name}")
	end
	
	@property
	fun salary(value: 30000, status)
		if status == "GET":
			return value
		elseif status == "SET":
			return value
	end
	
	@onevent(\delete)
	fun _handleDeletion(evt)
		# event handler logic
	end
	
	fun _macc meta, var()
		# macro definition
	end
end

fun Person static, var()

	return static
	var mindset = "positive"

	fun getMood()
		if mindset == "positive":
			print("happy")
		elseif mindset == "neutral":
			print("pleasant")
		else:
			print("sad")
	end

end
```

#### AsyncFunction

```
fun :: AsyncFunction(String -> String)
@async sayHello(word)
	var name = FileSystem.File("/file.txt").read()
	var greet = await name + word
	return await greet
end
```

#### Object

```
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

```
person
	..name = "Jack" # Jack
	..greet("hello") # hello from Jack
	..getMood() # pleasant
```

#### Object Literal

```
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

```
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
if num > 10:
	print("greater")
elseif num < 10:
	print("lesser")
else:
	print("equals")
	
var sign = if num >= 0: 1 else: -1

var x = 7
var y = x of @Trait {
	1 -> "sunday",
	2 -> "monday",
	3 -> "tuesday",
	4 -> "wednesday",
	5 -> "thursday",
	6 -> "friday",
	7 -> "saturday",
	8 | 9 | 10 -> "hello Martian!",
	_ -> "invalid"
}

print(y) # "saturday"

```

#### The For loop

```
x = 1
for x < 100
	print(x)
end

for x < 100
	print(x)
done m
	print(x ^ 2)
end

for(x = 1; x < 10; x += 1)
	print(x)
end

arr = [1, 2, 3, 4, 5, 6, 7]
for k, v in arr
	print(v)
end

for v in 1 to 10
	print(v)
end

# same as

for v in 1 to 10: print(v)
```

#### The break and continue statements

```
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

```
codes = ["AO", "ZD", "SG", "EZ"]
if _, code in codes
	print("This is an acceptable code")
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
done m
	print("finished")
end
```

#### More on Types, Methods & Modules

#### Type Signatures and Conversions

```
var :: Int16
a = 16

var :: String
b = "hello"

# same as
var c :: String = "125"

"125" to type :: Int # 125
```

#### Type Conversions and Promotions

```
type.parse(type :: Int16, 12) # 12
type.parse(type :: Int32, "121") # 121

type.promote(1, 2.5, 3//4) # 1.0, 2.5, 0.75
type.promote(1.5, 0 + 1!im) # 1.5 + 0.0!im, 0.0 + 1.0!im

type.promote(true, \c, 1.0) # 1.0, 99.0, 1.0
```

#### The type hierarchy – subtypes and supertypes

```
type.super(type :: Int64) # type :: Signed

type.super(type :: Signed) # type :: Integer

type.super(type :: Integer) # type :: Real

type.super(type :: Real) # type :: Number

type.super(type :: Number) # type :: Any

type.super(type :: Any) # type :: Any

type.subs(type :: Integer)
# type :: DataType(BigInt, Bool, Char, Signed, Unsigned)

type.subs(type :: Signed)
# type :: DataType(Int128, Int16, Int32, Int64, Int8)

type.subs(type :: Int64)
# DataType(Null)
```

#### Concrete and Abstract Types

Concrete types have no subtypes and might only have abstract types as their supertypes.

An abstract type (such as Number and Real) is only a name that groups multiple subtypes together, but it can be used as a type annotation or used as a type in array literals.

#### User Defined and Composite Types

```
type Point = NamedTuple(Float64, Float64, Float64)

var :: Point
p = var(f1, f2, f3)
```

#### When are two values or objects equal or identical?

```
var i16 = 125 to type :: Int16
var i64 = 125 to type :: Int64 # default
var d = { a: 100, b: 200, c: 300 }

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

```
expr :: (1 + 2)
expr :: do
	var a = 5
	var b = 2
	a + b
end
```

#### Eval and Interpolation

```
var e1 = Expr(\call, (*), 3, 4)
 # expr :: ((*)(3, 4))

var a = 4
expr :: do
	var b = 1
	var e5 = expr :: $a + b
end # expr :: 4 + b
```

#### Defining Macros

Macro takes the input expressions and returns the modified expressions at parse time

```
fun macint meta as ex, var()
	expr :: do
		print("start")
		ex
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

```
var :: Channel(String)
chan1 = Channel(type :: String, \server; default: "", capacity: 4)
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

var  chan2 = Channel(type :: String)

await channeler2(chan2)

for true
    var res = ~chan1
	if res is (end)
		print("Channel Closed")
		break
	end
    print("Channel Open: ", res)
end

var chan3 = Channel(type :: String; capacity: 4)

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

```
stream = IO.stdin
for line in stream.lines:
	print(f"Found $line")

var file = FileSystem.File("example.dat")

for line in file.lines:
	print(line)
done
	file.close()
end
```

#### TCP Sockets and Servers

```
var server = HTTP.serve({ \port: 8080 })

@async
for req in server
	req.respond({ \body: 'Hello World\n' })
end
```

#### Parallel Operations and Computing

```
for pid in workers()
	# do something with each process (pid = process id)

end

@parallel
for i in 1:100000
	arr[i] = i
end
```

#### Running External Programs

#### Running Shell Commands

```
Shell.pwd() # "c://test"
Shell.cd("c://test//week1")
Shell.ls()

var cmd = "echo Cliver is clever"
Shell.run(cmd) # returns Cliver is clever

Shell.run("date")
# Sun Oct 12 09:44:50 GMT 2014

cmd = "cat file1.txt"

Shell.run(cmd)
# prints the contents of file1.txt
```

#### Calling C and FORTRAN

```
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

```
FFI.Python.eval("10*10") # 100

@FFI.pyimport math
math.sin(math.pi / 2) # 1.0
```

#### Calling JavaScript

```
FFI.JavaScript.eval("10*10") # 100
FFI.JavaScript.eval("Math.PI * 2") # 6.2857
```
