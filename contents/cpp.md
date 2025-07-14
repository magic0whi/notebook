# C++ Notes

## Notice

- If an object have pointer member inside, write copy constructor, destructor.
- Default float type is `double`, use `float a = 5.5f`.
- Header or inline?  (the latter copies whole function body into the area where the function is called).
- `constexpr` and `static` are independent of each other. `static` defines the object's lifetime during execution; `constexpr` specifies the object should be available during compilation.
- Always make sure that you profile is actually meaningful in a release because you're not going to be shipping code in debug anyway
- You should 100% use smart pointers if you are doing serious work.

## Assembly

```cpp
int main(int const argc, char const* argv[]) {
  if (argc > 5) return 29;
  else return 42;
}
```

```nasm
cmp edi, 5      // Compare argc to 5
mov edx, 42     // Loads 42 to edx
mov eax, 29     // Loads 29 to eax
cmovle eax, edx // Condition move, if the above cmp get false, move edx to eax
ret
```

## How C++ Works

* A translation unit consists of a single `.cpp` file and its associated `.h` files.
* Compile Process Path: Source&rarr;Compile&rarr;Linker&rarr;Executables

1. Pre-process
   Compiler parses all the macros (such as `#include`) in source file.
   - Clang: `clang -x c++ -E hello.cpp -o hello.i`
   - GCC: `cpp hello.cpp > hello.i`
   - VS2015: `Project Settings`&rarr;`Preprocessor`&rarr;`Preprocess to a File`
2. Compile & Assembly
   - Clang: `clang++ -x c++-cpp-output -S hello.i -o hello.o`
   - GCC: `g++ -S hello.i && as hello.s -o main.o`
   - VS2015: Compile Only (`<C-F7>`)
3. Linker
   Externally defined functions will be integrated in the link phase. Function declarations that never be called will be optimized away.
   
   The parameter of `ld` are platform specific (mainly depends on Clang/GCC version). Enable verbose to get the parameter of the `collect2` (which is an alias of `ld`):
   For Clang:
   ```bash
   # # Only run preprocess, compile, and assemble steps
   $ clang++ -v -c hello.cpp -o hello.o
   # # For GCC:
   $ g++ -v -c hello.cpp -o hello.o
   ```
   `ld` may look messy, but you can significantly shorten that link line by removing some arguments. Here's the minimal set I came up after some experimentation:
   ```bash
   $ ld -I/lib64/ld-linux-x86-64.so.2 \
   -o hello \
   /usr/lib64/Scrt1.o \
   -L/usr/lib64/gcc/x86_64-pc-linux-gnu/14.2.1 \
   hello.o \
   -l stdc++ -l m -l gcc_s -l gcc -l c \
   /sbin/../lib64/gcc/x86_64-pc-linux-gnu/14.2.1/crtendS.o \
   /usr/lib64/crtn.o
   ```

## Primitive Types (Fundamental Type)

- The difference between C++ data types are simply different allocated memory size.
- You can use `sizeof()` to see the data type size.
- Trivial type: either a primitive type or a type composed of only trivial types.

  Trivial type can be copied and moved with `memcpy`, `memmove` and constructed destructed without doing anything. Can be checked using `std::is_trivial<Type>()`.

Different memory allocation size for C++ Data Type:

| Primitive Type | Length |
| -------------- | ------ |
| `char` | 1 byte |
| `short` | 2 bytes |
| `int` | 4 bytes |
| `long` | 8 bytes (`c++20`), >= 4 bytes |
| `long long` | 8 bytes |
| `float` | 4 bytes |
| `double` | 8 bytes |
| `void*` | 8 bytes (64 bits), 4 bytes (32 bits) |

## Functions

- Write formal parameters with `const` if possible.
- *Function* is a function **not** in a class. Whereas *method* is a function in a class.
- Don't frequently divide your code into functions, calling a function requires creating an entire stack frame. This means we have to push parameters and so on into the stack, and also pull something called the return address from the stack, so that after the function executed the `PC` (Program counter) register could return to the address before the function call.
  Conclusion: Jumping around in memory to execute function instructions consumes additional time.

## Header Files

Duplicate inclusion: You include header file `b.h` in `a.cpp`, but `b.h` includes another header file `c.h`, while you have already included `c.h` before in `a.cpp`.

- Way one: `#pragma once`
- Way two:
  ```cpp
  // Log.h
  #ifndef _LOG_H
  #define _LOG_H
  // some sentence...
  #endif
  ```

## Visual Studio Setup & Debug

- Use `Show All Files` view under `Solution Explorer`.
- By default, VS2015 put intermediate files in debug directory
- It's recommend to set `Output Directory` into `$(SolutionDir)bin\$(Platform)\$(Configuration)\`
  and set `Intermediate Directory` into `$(SolutionDir)bin\intermediate\$(Platform)\$(Configuration)\`
- The `watch view` in VS2015 allows you to specify the variables to be monitored,
  In `memory window` you can search by keyword `&a` to show the address of variable `a`
- The default value of uninitialized variables is `0xcccccccc`

## Pointers

- The pointer represents a memory address, generally the data type of the pointer is used to represent the type of the data at the target address.
- Pointer to Pointer:
  ```cpp
  import std;
  int main() {
    char* buf{new char[8]}; // Allocate a space with 8 chars
    std::memset(buf, 0, 8); // Fill it with zero,
    char** ptr_to_ptr{&buf}; // pointer to pointer
    delete[] buf; // Finally release the memory space.
  }
  ```
  In memory, it may like this:
  ```plaintext
  0x00B6FED4 &buf:           00 D0 FF F0
  0x00D0FFF0 *(new char[8]): 00 00 00 00 00 00 00 00
  0x???????? &ptr_to_ptr:    00 B6 FE D4
  ```
  > Due to x86's little-endian design, what we see from `Memory View` is start from lower bits to higher bits, which is reversed from human's convenient that write the most significant digit first. e.g.:
  > ```plaintext
  >                    0x0 0x1 0x2 0x3
  > 0x00B6FED4 (&buf):  F0  FF  D0  00
  > ```

## Reference

- Variables are convert to memory address in assembly by compiler. Reference let compiler just substitute memory address as is (like a macro) using its copy operator (`=()`), so it is different to `const void*` with creates a memory area to store a memory address (Can be `NULL`).
- Copy operator `=()` copies value of a variable. Send the actual parameters to a function implicitly calls copy operator.
- Dereference operator (aka. indirection operator) `*()` get the value from a memory address.
- Address-of operator `&()` obtain the memory address of a variable. Since directly send variable name to `=()` only get its stored values.

## Classes vs Structs, and Enums

They are no different in low level, so a `class` can inherit a `struct` (Not recommend).

`sturct` is more suitable for store multiple variables, its variables are default have attributed `public`, therefore it's convenient to express a data structure. While `class` is more suitable for express object, which has both member variables and methods.


### Struct Bit-fields
```cpp
struct S {
  unsigned int a : 1 {0}; // Set default value is allowed in C++20
  unsigned int b : 8 = 'a';
  int c : 23;
  long e : 32;
};
int main() {
  // Bit-field size: 1 + 7 + 24 + 32 = 64 (12 bytes), depends on the largest
  // primitive type in structure
  std::println("Size of Sttucture with Bit Fields: {}", sizeof(S));
}
```

### Enum

Enum is a way to define a set of distinct values that have underlying integer types (, see below).

```cpp
import std;
class Log {
// Access specifiers 'public', 'private' can be placed multiple times
public:
  // Can use `char` type as well
  // enum Level : unsigned char
  enum Level { LevelError = 1, LevelWarning, LevelInfo }; // Start from one,
  // default is 0
private:
  Level m_log_lv{LevelInfo};
public:
  void set_lv(Level lv) noexcept { m_log_lv = lv; }
  void err(const std::string_view msg) const noexcept {
    if (m_log_lv >= LevelError) std::println("[Error]: {}", msg);
  }
  void warn(const std::string_view msg) const noexcept {
    if (m_log_lv >= LevelWarning) std::println("[WARN]: {}", msg);
  }
  void info(const std::string_view msg) const noexcept {
    if (m_log_lv >= LevelInfo) std::println("[INFO]: {}", msg);
  }
};
int main() {
  Log log;
  log.set_lv(Log::LevelWarning); // Enum name is optional
  log.err("Hello"), log.warn("Hello"), log.info("Hello");
}
```

> In C++20 you can use `using enum` to create alias for enums.

## Static

- Static functions and variables outside of class has the scope limit in its translation unit (like `private` in a class). But define static functions or variables that share a same name in different translation unit will cause duplicate definition error in linking stage.
- Static variable inside a class or struct means that variable is going to share memory with all the instances of the class, in other words there's only one instance of that static variable. Static methods cannot access non-static members its class, hence it doesn't have instance of the class.
- Define `static` variables in header files if possible.
- Local Static
  ```cpp
  import std;
  void func() noexcept {
    static int s_i{}; // 's_' means static
    std::println("{}", ++s_i);
  }
  int main() { func(), func(), func(), func(); }
  ```

### Classical Singleton

Singleton are classes that allow only one instance.
- One way:
  ```cpp
  import std;
  class Singleton {
  private:
    constinit static Singleton* s_instance;
    Singleton() noexcept {}; // Private empty construct function
    // prevents instantiate
  public:
    static Singleton& get() noexcept { return *s_instance; }
    void hello() const noexcept { std::println("Hello"); }
  };
  constinit Singleton* Singleton::s_instance{nullptr}; // Static members in
  // class shoud defined out-of-line, here I given a nullptr to pass the static
  // analyze
  int main() { Singleton::get().hello(); } // Though no memory spaces created
  // for the class, we can still access methods
  ```
- Another way:
  ```cpp
  import std;
  class Singleton {
  private:
    Singleton() {};
  public:
    static Singleton& get() {
      static Singleton s_instance; // Put instance into a local static variable
      // (Pro: less code)
      return s_instance;
    }
    void hello() { std::println("Hello"); }
  };
  int main() { Singleton::get().hello(); }
  ```

## Constructors & Destructors

Constructor provides a way to initialize primitive types when creating instance. Otherwise, you have to do it manually, or they will be keep whatever is left over in that memory.

To prevent creating instance, you can set constructor as private, or delete it.
```cpp
class Log {
private:
  Log() {} // One way
public:
  // Log() = delete; // Another way
  static void write() {}
};
int main() {
  Log::write(); // Only Write() can be invoke
  // Log l; // Now you cannot access the constructor
}
```

Destructor provides a way to gently recycle memory when `delete` an object.
It can be called directly: `SomeClass.~SomeClass();`

## Inheritance & Virtual Functions

- Size of derived class (aka. subclass): `(base class) + (defined variables)`.
- Derived class implicitly call base class's constructor.

Why we need virtual function:
```cpp
import std;
class Entity {
public:
  std::string_view get_name() const noexcept { return "Entity"; }
};
class Player : public Entity { // Public inheritance keep public members in base
// class public in derived class, otherwise they becomes to private
private:
  std::string m_name;
public:
  Player(std::string const& name) noexcept : m_name{name} {}
  std::string_view get_name() const noexcept { return m_name; }
};
int main() {
  Entity* entity{new Entity};
  std::println("{}", entity->get_name());
  delete entity;

  Player* player{new Player{"Cherno"}};
  std::println("{}", static_cast<Entity*>(player)->get_name()); // Cast player to
  // Entity
  delete player;
}
```
Outputs:
```bash
Entity
Entity
```
The problem occurs that the second output should be `"Cherno"`. When the pointer type is the main class `Entity`, the method `get_name()` uses its main class' version even it's actually an instance of `Player`, this definitely a problem.

If you want to override a method you have to mark the method in the base class as `virtual`. Correct version:
```cpp
class Entity {
public:
  // Now with 'virtual' qualified
  virtual std::string_view get_name() const noexcept { return "Entity"; }
  virtual ~Entity() { std::println("Entity destroied"); } // Have a virtual
  // constructor to delete an derived class through a pointer to base class
};
class Player : public Entity {
private:
  std::string m_name;
public:
  Player(std::string const& name) noexcept : m_name{name} {}
  // 'override' is not necessary but it can avoid typo and imporve readability
  std::string_view get_name() const noexcept override { return m_name; }
  ~Player() override { std::println("Player destroied"); }
};
int main() {
  Entity* entity{new Entity};
  std::println("{}", entity->get_name());
  delete entity;

  Player* player{new Player{"Cherno"}};
  entity = player;
  std::println("{}", entity->get_name());
  delete entity;

  Player player2{"Cherno"};
  std::println("{}", static_cast<Entity&>(player2).get_name()); // Cast to
  // reference for objects on the stack, otherwise it copies the Player to a
  // temporary Entity objects
}
```

> `virtual` could reduce "dynamic dispatch" (change object's vtable in runtime).

> `virtual` has its own overhead, it needs extra vtable space, in order to dispatch the correct method it includes a member pointer in the base class that points to the vtable. And every time we call virtual method, we go through that table to decision which method to map.
> Through the extra overhead it's still recommended to use as much as possible.

### Access Specifier & Inheritance Types

| Access Specifier |  Same Class | Derived Class | Outside Class |
| ---------------- | ----------- | ------------- | ------------- |
| `public`         | Yes         | Yes           | Yes           |
| `protected`      | Yes         | Yes           | No            |
| `private`        | Yes         | No            | No            |

<table><thead>
  <tr>
    <th>Inheritance Type</th>
    <th>: public base</th>
    <th>: protected base</th>
    <th>: private base</th>
  </tr></thead>
<tbody>
  <tr>
    <td>public member</td>
    <td>public</td>
    <td>protected</td>
    <td>private</td>
  </tr>
  <tr>
    <td>protected member</td>
    <td colspan="2">protected</td>
    <td>private</td>
  </tr>
  <tr>
    <td>private member</td>
    <td colspan="3">N.A.</td>
  </tr>
</tbody>
</table>

### Interface (Pure Virtual Method)

```cpp
import std;
class Entity {};
class Printable { // Interface class cannot be instantiated directlly
public:
  virtual std::string_view get_class_name() const noexcept = 0; // Interface
  // (pure virtual method)
  virtual ~Printable() {}
};
class Player : public Entity, public Printable { // A derived class can inherit
// multiple interface class
public:
  std::string_view get_class_name() const noexcept override { return "Player"; }
  ~Player() override {}
};
// Now through the Player instance is casted into its base class, it will still
// use derived class's function implement
inline void print(Printable* obj) noexcept { std::println("{}", obj->get_class_name()); }
int main() {
  Player* player{new Player};
  print(player);
  delete player;
  // print(new Player); // Don't do this, it's very easily to cause memory leak
}
```

## Visibility in C++

- The default visibility of a Class would be `private`. If it's a `struct` then it would be `public` by default.
- `private` things only visible in its own class, nor in derived class, except for `friend` classes.
- `protected` things can be seen by derived class.

## Literal Arrays & C++11 Standard Arrays

> Be aware for operations out of index (e.g. `example[-1] = 0`), in C++ you can do this by force the compiler to ignore this check, and it's definitely discouraged.

- Literal Array
  ```cpp
  import std;
  int main() {
    int arr[5]; // On stack, destory on function end
  
    int* arr2{new int[5]}; // on heap, would not auto destory
    delete[] arr2; // Use square brackets to release an array on heap
  
    int* ptr{arr}; // 'arr' is actually a pointer which stores the begin
    // address of the array
    for (int i = 0; i < 5; i++) arr[i] = i;
  
    arr[2] = 5;
    *(ptr + 2) = 5; // this is equal but in a pretty wild way
    // Bacause 'ptr' has type 'int' (32 bits, 4 bytes),
    // so + 2 let it advance two 'int's length (64 bits, 8 bytes)
    // We can also do the same operation in this form (char is 8 bits, 1 bytes)
    *reinterpret_cast<int*>(reinterpret_cast<char*>(ptr) + 8) = 5;
  
    for (int i{}; i < 5; i++) std::println("{}", arr[i]);
  
    // You cannot dynamically chack a raw array's size.
    int count{sizeof(arr) / sizeof(int)}; // Ways like this is unstable
    std::println("arr's size: {}", count);
  
    // A good ways is to use an constant to remember the array size,
    // or using c++11 standard arrays instead.
    static int const& arr_size{5};
    int arr3[arr_size];
  }
  ```
- Standard Arrays
  It's more safe, but has a little bit more overhead.
  ```cpp
  import std;
  int main() {
    std::array<int, 5> arr;
    for (std::size_t i{}; i < arr.size(); i++) arr[i] = 2;
  }
  ```

## How Strings Work (and How to Use Them)

### C-style Strings (String Literals) and std::string_view

C-style strings are stored in code segment (virtual address space, which is read-only), this means you can only replace new string to the variable to "change" it.
```cpp
import std;
int main() {
  char const* name{"Cherno"};
  "Cherno" + " hello!"; // You cannot call 'operator+()' to literal strings since
  // it's constant
  std::string_view name2{name}; // C++17, equivalent to 'const char*'
}
```

> Each strings at end have `\0` (named "null termination character") to prevent out of index in iterating. e.g. `char str[7] = {'C', 'h', 'e', 'r', 'n', 'o', '\0'};`

> Terminal character will actually break the behavior of string in many cases, use `std::string_view` can prevent this problem.
> ```cpp
> import std;
> import std.compat;
> int main() {
>   char name[8]{"Che\0rno"};
>   std::println("{}", strlen(name));
> }
> ```

A sample implementation of `std::string_view`:
```cpp
import std;
class StaticString {
  using const_iterator = char const*;
private:
  char const* const m_str;
  std::size_t const m_size;
public:
  template <std::size_t N>
  constexpr StaticString(char const (&str)[N]) noexcept : m_str{str}, m_size{N - 1} {}
  constexpr StaticString(char const* str, std::size_t N) noexcept : m_str{str}, m_size{N} {}
  constexpr char const* data() const noexcept { return m_str; }
  constexpr std::size_t size() const noexcept { return m_size; }
  constexpr const_iterator begin() const noexcept { return m_str; }
  constexpr const_iterator end() const noexcept { return m_str + m_size; }
  constexpr operator char const*() const noexcept { return m_str; }
  constexpr char operator[](std::size_t n) const {
    // clang-format off
    return n == std::numeric_limits<std::size_t>::max()
      ? m_str[m_size - 1]
      : n < m_size ? m_str[n] : throw std::out_of_range(std::format("static_string: out of range, index at {}", n));
    // clang-format on
  }
};
std::ostream& operator<<(std::ostream& os, StaticString const& str) { return os.write(str.data(), str.size()); }
template <typename CharT>
struct std::formatter<StaticString, CharT> {
  template <class ParseContext> constexpr ParseContext::iterator parse(ParseContext const& ctx) const noexcept { return ctx.begin(); }
  template <class FmtContext>
  constexpr FmtContext::iterator format(StaticString str, FmtContext& ctx) const noexcept { return std::ranges::copy(str, ctx.out()).out; }
};
int main() {
  constexpr StaticString str{"homo114514"};
  std::cout << str << '\n';
  std::println("{}", str);
  try {
    str[-1];
    str[-2];
  } catch (std::out_of_range e) { std::cout << e.what() << '\n'; }
}
```

### std::string

It's a char array indeed.

```cpp
import std;
int main() {
  std::string str{"Cherno"};
  str += " hello!"; // operator+=() is overloaded in the string class to let you concatenate
  std::println("{}", str);

  constexpr std::string str2{"Cherno"s + " hello!"}; // This does more object copy operations, but can be calculated at compile-time
  std::println("{}", str2);

  constexpr std::string tmp1("Cherno"), tmp2("hello!");
  std::string str3{std::format("{} {}", tmp1, tmp2)}; // C++20 std::format
  std::println("{}", str3);

  constexpr bool contains = str2.find("no") != std::string::npos; // Check whether a string has specific word
  std::println("str2 contains \"no\"? {}", contains);
}
```

Raw string and multibyte character:
```cpp
import std;
inline std::size_t utfrtomb(char* cur_char, char8_t in_char, std::mbstate_t* state) noexcept {
  return std::c8rtomb(cur_char, in_char, state);
}
inline std::size_t utfrtomb(char* cur_char, char16_t in_char, std::mbstate_t* state) noexcept {
  return std::c16rtomb(cur_char, in_char, state);
}
inline std::size_t utfrtomb(char* cur_char, char32_t in_char, std::mbstate_t* state) noexcept {
  return std::c32rtomb(cur_char, in_char, state);
}
inline std::size_t utfrtomb(char* cur_char, wchar_t in_char, std::mbstate_t* state) noexcept {
  return std::wcrtomb(cur_char, in_char, state);
}
template <typename T, std::size_t N>
auto utf_to_char(T const (&str)[N]) noexcept {
  struct {
    char data[4 * (N - 1) + 1];
  } ret{}; // Return a struct, otherwise stack-use-after-return would throw
  char* cur_char{ret.data};
  for (std::size_t read_count{}, i{}; i < N; i++) {
    read_count = utfrtomb(cur_char, str[i], nullptr);
    if (read_count == static_cast<std::size_t>(-1)) break;
    cur_char += read_count;
  }
  return ret;
}
template <typename T>
auto utf_to_char(T const& str) noexcept {
  auto ret{std::make_unique<char[]>(4 * str.size() + 1)};
  char* cur_char{ret.get()};
  for (std::size_t read_count{}, i{}; i < str.size(); i++) {
    read_count = utfrtomb(cur_char, str.c_str()[i], nullptr);
    if (read_count == static_cast<std::size_t>(-1)) break;
    cur_char += read_count;
  }
  return ret;
}
int main() {
  constexpr char raw_str[]{R"(Line1
Line2
Line3
Line4)"}; // Useful or you want to keep format
  constexpr char8_t name1[]{u8"プロテウス"}; // UTF-8, new type in C++20, behaves
  // like 'unsigned char' but may be larger than char's 1 byte
  constexpr char16_t name2[]{u"プロテウス"}; // UTF-16, two bytes per character
  constexpr char32_t name3[]{U"プロテウス"}; // UTF-32, four bytes per character
  constexpr wchar_t name4[]{L"プロテウス"}; // either 2 or 4 bytes, depends on
  // compiler

  using namespace std::string_literals; // C++14 Standards
  std::u8string name5{u8"プロテウス"s + u8" こんにちわ！"};
  std::wstring name6{L"プロテウス"s + L" こんにちわ！"};
  std::u32string name7{U"プロテウス"s + U" こんにちわ！"};

  std::println("{}", raw_str);
  std::locale::global(std::locale{"en_US.UTF-8"});
  std::println("{}", utf_to_char(name1).data);
  std::println("{}", utf_to_char(name2).data);
  std::println("{}", utf_to_char(name3).data);
  std::println("{}", utf_to_char(name4).data);

  std::println("{}", utf_to_char(name5).get());
  std::println("{}", utf_to_char(name6).get());
  std::println("{}", utf_to_char(name7).get());
}
```

## Constants in C++

The mutability of a constant depends on how it stores:
- String literal stored in the read-only section of the memory. So modifying will cause segmentation fault.
- Constant variables may convert to a literal and place the primitive value in assemble at compile-time, while if the code attempt to take the address of constant variable the compiler will let it place in memory.

### Constant Pointer

```cpp
import std;
int main() {
  constexpr int MAX_AGE{90}; // Same as 'int const' but it's value will
  // evaluate at compile-time

  // 1. Pointer to const value
  int const* a{new int};
  std::cout << a << '\n';
  // *a = 2; // I can't change the contents of the pointer
  delete a;
  a = reinterpret_cast<int const*>(&MAX_AGE); // But I can change the pointer
  // itself
  std::cout << a << '\n';

  // 2. Const pointers
  int* const b{const_cast<int*>(&MAX_AGE)};
  *b = 2; // I can change the contents of the pointer
  std::println("{}", MAX_AGE);
  // b = nullptr; // But I can't change the pointer's value

  // 3. Const pointer to a const value
  int const* const c{&MAX_AGE};
}
```

> `const int*` equals `int const*`.

### Const Method

Const methods cannot change member variables in the class, except for `mutable` and `static` variables.

```cpp
import std;
class Entity {
private:
  int m_x, *m_y;
  mutable int m_z;
public:
  int const* get_y() const noexcept { return m_y; } // When a const method return
  // pointer types, it should also be constant
  int get_z() const noexcept {
    // m_x = 2; // I can't change member variable
    m_z = 2; // But I can change mutable variable
    return m_z;
  }
};
int main() {
  Entity const& e{Entity{}};
  // e.set_x(); // A const object can only call its const methods.
  std::println("{}", e.get_z());
}
```

## Member Initializer List (Constructor Initializer List)

Member initializer list can prevent the use of `operator=()` which may initialize object twice.
```cpp
import std;
class Example {
public:
  Example() noexcept { std::println("Created Entity!"); }
  Example(int x) { std::println("Created Entity with {}!", x); }
};
class Entity {
private:
  Example m_ex;
  int x, y, z;
public:
  Entity() : m_ex{8}, x{}, y{}, z{} { // m_ex{8} equivalent to m_ex{Example{8}}
  // m_example = Example{8}; // This will initialize twice
  }
  Entity(int x, int y) { this->x = x, this->y = y; } // 'this' is a pointer point
  // to current object, use 'this' to avoid ambiguity in member variable and the
  // method's args
};
int main() { Entity e; }
```

## Ternary Operators in C++ (Conditional Assignment)

Ternary simplify `if else` sentences:
```cpp
constinit static int s_level{1};
constinit static int s_speed{2};
int main() {
  s_speed = s_level > 5 && s_level < 100 ? s_level > 10 ? 15 : 10 : 5;
  // equivalent to:
  // if (s_level > 5 && s_level < 100)
  //   if(s_level > 10) s_speed = 15;
  //   else s_speed = 10;
  // else s_speed = 5;
  std::println("{}", s_speed);
}
```

## Create / Instantiate Objects

There are two main sections of memory: stack and heap.
- Stack objects have an automatic lifespan, their lifetime is actually controlled by their scope.

  The stack size is small (usually 1~10 MiB), if you have a big object, you have to store it in the heap.

  Compiler may let objects create on heap when it diagnostics the content of the object goes big (e.g. `std::string`), these objects use a smart pointer to release memory automatically.
- Heap: once you allocated an object in the heap, it's going to sit there until you explicitly delete it.

```cpp
import std;
class Entity {
public:
  Entity(std::string_view const str) { std::println("{}", str); }
};
int main() {
  Entity entity{"Cherno"}; // Without 'new', object probably creates on stack
  Entity* entity2{new Entity{"Cherno"}}; // With 'new', object creates on heap,
  // 'new' returns the memory address
  delete entity2; // We need manually release the object on the heap
}
```

> Manual resource release is memory leak prone, use smart pointer is a better idea.

### The New / Delete Keyword

How the `new` keyword find free space on memory? There is something called *free list* which maintain the addresses that have bytes free. It's obviously written in intelligent, but it's still quite slow.
- `new` is just an operator, it uses the underlying C function `malloc()`, means that you can overload `new` and change its behaviors. `new` also calls the constructor.
- `delete` is an operator as well, it calls the destructor of the object.

Three uses of `new` (normal `new`, array `new`, placement `new`)
```cpp
import std;
import std.compat;
class Entity {};
int main() {
  Entity* entity{new Entity}; // Normal 'new'
  delete entity; // Remember delete object

  // If we wanna an array of entites (An array which stores 50 objects of Entity)
  Entity* entity2{new Entity[50]}; // Array 'new'
  delete[] entity2; // Also, we need calling delete with square bracket

  // Placement 'new' is where you actually get to decide where the memory comes
  // from. You don't really allocating memory with 'new', but just calling the
  // constructor and initializing object in a specific memory address
  int* buffer{new int[50]};
  Entity* entity3{new (buffer) Entity};
  // delete entity3; // This will cause alloc-dealloc-mismatch
  delete[] buffer;

  // In C there are some kind of equivalent:
  Entity* entity4{static_cast<Entity*>(malloc(sizeof(Entity)))};
  new (entity4) Entity; // malloc() will not call the constructor so we need to
  // call it manually
  entity4->~Entity(); // free() also not call the destructor automatically
  free(entity4);
}
```

## Implicit Conversion and the Explicit Keyword in C++

```cpp
import std;
class Entity {
private:
  std::string_view m_name;
  int m_age;
public:
  Entity(std::string_view const name) noexcept : m_name{name}, m_age{-1} {}
  explicit Entity(int age) noexcept : m_name("Unknown"), m_age(age) {} // Use
  // 'explicit' keyword to disable implicit conversion
  std::string_view get_name() const noexcept { return m_name; }
};
void print_entity(Entity const& entity) { std::println("{}", entity.get_name()); }
int main() {
  Entity a = std::string_view{"Cherno"}; // This is an implicit conversion, it
  // implicitly converts std::string_view{"Cherno"} into Entity's constructor
  // method Entity(std::string_view const& name)
  // It's weird, you can't do this in other languages (such as C# or Java)

  Entity b{22}; // Call constructor directly, {} is uniform initialization, it's
  // narrowing conversion (high to low precision) prevention
  // Entity b = 22; // I can't do implicit conversion with explicitly qualified
  // method

  // C++ allows only one implicit conversion at same time, "Cherno" is a constant
  // char array, C++ needs two conversions, one from const char* to
  // std::string_view, and then call into Entity(const std::string_view& name)
  // Entity c = "Cherno"; // Fail
  // print_entity("Cherno"); // Fail
  print_entity(std::string_view{"Cherno"});
  print_entity(Entity{"Cherno"});
  print_entity({"Cherno"}); // Same as above
}
```

## Operators and Operator Overloading

In the case of operator overloading, you're allowed to define or change the behavior of operator

> *Operators are just functions*

Here goes some examples:
```cpp
import std;
struct Vector2 {
  float x, y;
  constexpr Vector2(float const x, float const y) noexcept : x{x}, y{y} {}
  constexpr Vector2 operator+(Vector2 const& other) const noexcept { // Overload
  // the 'operator+()' equals redefine the behavior of '+' in this Object
    return Vector2(x + other.x, y + other.y);
  }
  constexpr Vector2 operator*(Vector2 const& other) const noexcept {
    return Vector2(x * other.x, y * other.y);
  }
  constexpr bool operator==(Vector2 const& other) const noexcept {
    return x == other.x && y == other.y;
  }
  constexpr bool operator!=(Vector2 const& other) const noexcept {
    return !operator==(other); // Or
    // return !(*this == other);
  }
};
std::ostream& operator<<(std::ostream& stream, Vector2 const& other) noexcept {
  return stream << '[' << other.x << ", " << other.y << ']';
}

template <>
struct std::formatter<Vector2, char> {
  template <class ParseContext>
  constexpr ParseContext::iterator parse(ParseContext const& ctx) const noexcept { return ctx.begin(); }
  template <class FmtContext>
  FmtContext::iterator format(Vector2 vec2, FmtContext& ctx) const noexcept {
    return std::format_to(ctx.out(), "[{}, {}]", vec2.x, vec2.y);
  }
};
int main() {
  // 'constexpr' can improve performance by lettinghe compiler pre-calculate
  // values at compile-time
  constexpr Vector2 pos{4.0f, 4.0f}, spd{0.5f, 1.5f}, time{1.1f, 1.1f}, res{pos + spd * time};
  // We cannot output the variables in vector directly, we need overload the
  // operator<<()
  std::cout << res << '\n';
  std::println("{}", res); // Or overload std::formatter for std::print

  // In programs such as Java we have to use equals() to compare objects, but in
  // C++ we can simply overload the operator==()
  if (res == pos) std::println("foo");
  else std::println("bar");
}
```

In C++23, explicit object member functions make it possible to deduplicate const- and non-const member functions:
```cpp
struct S {
  std::vector<int> m_vec;
  S(std::initializer_list<int> arr) : m_vec{arr} {}
  // Before C++23
  int operator[](std::size_t idx) { return m_vec[idx]; }
  int operator[](std::size_t idx) const { return m_vec[idx]; }
  // auto operator[](this auto&& self, std::size_t idx) { return self.m_vec[idx]; }
};
int main() {
  S const s{1, 2, 3};
  std::println("{}", s[1]);
}
```

## Object Lifetime (Stack / Scope Lifetimes)

- Don't return object stored in stack
- Use `{}` to create a local scope so that stacked things will be released earlier.
- Underlying of unique pointer
  ```cpp
  import std;
  int* CreateArray() {
    int arr[50]; // Don't write code like this
    return arr; // The array gets cleared as soon as we go out of scope
  }
  class Entity {
  public:
    void print() { std::println("Print from Entity!"); }
    ~Entity() { std::println("Entity released~"); }
  };
  // 'std::unique_pointer' is a scoped pointer, here we write our own to show
  // how it works
  template <class T>
  class ScopedPtr {
  private:
    T* m_ptr;
  public:
    ScopedPtr(T* ptr) noexcept : m_ptr{ptr} {}
    ~ScopedPtr() { delete m_ptr; }
    T* operator->() noexcept { return m_ptr; } // operator->() is special, it's
    // invoked in a loop to call another operator->() if the return value is
    // another object (not a pointer), and will finally dereference the founded
    // pointer.
    T& operator*() noexcept { return *m_ptr; }
    T* get() noexcept { return m_ptr; }
    ScopedPtr(ScopedPtr<T>&) = delete; // Inhibit copy constructor
    ScopedPtr<T> operator=(ScopedPtr<T>) = delete; // Inhibit copy assignment
  };
  int main() {
    { // Local scope
      Entity e; // the object created on stack will gets free when out of the
      // scope
      ScopedPtr<Entity> ptr = {new Entity};
      // ScopedPtr<Entity> ptr2{ptr}; // ScopedPtr is unique and don't allow
      // copy
      ptr->print();
      (*ptr).print();
      (*ptr.get()).print();
    }
    // Since the ScopedPtr gets allocated on the stack, which means it will
    // gets released when out of the scope and calls ~ScopedPtr()
  }
  ```

### The Arrow Operator

- It's possible to overload the `operator->()` and use it in specific class such as ScopedPtr
- It can also be used to get the variable's memory offset in an object (memory hack):
  ```cpp
  import std;
  struct Vector3 {
    float z, y, x; // I deliberately desrupt the naming order to make it in a
    // different memory layout.
  };
  int main() {
    // float has 4 bytes, 32 bits; std::size_t (unsigned long) in C++20 has 8 bytes, 64 bits
    std::size_t const offset_x{reinterpret_cast<std::size_t>(&static_cast<Vector3*>(0)->x)};
    // 0 can be replaced with nullptr as well
    std::size_t const offset_y{reinterpret_cast<std::size_t>(&static_cast<Vector3*>(nullptr)->y)};
    std::size_t const offset_z{reinterpret_cast<std::size_t>(&static_cast<Vector3*>(nullptr)->z)};
    std::println("{}, {}, {}", offset_x, offset_y, offset_z);
  }
  ```

## Smart Pointers (`std::unique_ptr`, `std::shared_ptr`, `std::weak_ptr`)

Smart pointers are that when you call `new`, you don't have to call `delete`. Actually in many cases with smart pointers we don't even have to call `new`.

- **Shared pointer** & **Weak pointer**

  Shared pointer uses something called reference counting. If create one shared pointer and define another shared pointer and copy the previous one, the reference count is now 2; when the first one dies (out of scope), the reference count goes down 1; when the last one dies. The reference count goes back to zero and free the memory.
  Weak pointer will not increase the reference count.

```cpp
import std;
class Entity {
public:
  Entity() noexcept { std::println("Created Entity!"); }
  ~Entity() { std::println("Destoryed Entity~"); }
  void print() const noexcept {}
};
int main() {
  std::unique_ptr<Entity> unique_entity{new Entity}; // All smart pointer are
  // marked as explicit due to exception safety
  auto unique_entity2{std::make_unique<Entity>()}; // The preferred way to
  // construct this would be use std::make_unique<T>()

  unique_entity2->print(); // Can be accessed normally

  // std::unique_ptr<Entity> e0{unique_entity2}; // I cannot copy unique pointer, because in the definition of unique pointer, the copy constructor and copy assignment operator have been deleted

  std::weak_ptr<Entity> weak_entity; // Weak pointer won't increase the reference
  // count
  { // For shared pointer use make_shared is very recommand because its more
  // efficient
    auto shared_entity{std::make_shared<Entity>()};
    std::println("Current count: {}", shared_entity.use_count());
    auto shared_entity2{shared_entity};
    std::println("Current count: {}", shared_entity.use_count());
    weak_entity = shared_entity;
    std::println("Current count: {}", shared_entity.use_count());
  } // The shared_entity will be free immediately here.
}
```

## Copying and Copy Constructors

`operator=()` does shallow copy. An object created on heap without a copy constructor or an object created on stack but with pointer variables that point objects on heap will lead to unexpected results since shallow copy don't copy them fully but just the address in pointer variable. So a copy constructor is required to rewrite the behavior of the copy operation.

```cpp
import std;
// import std.compat;
class String {
private:
  char* m_buffer;
  std::size_t m_size;
public:
  template <std::size_t N>
  String(char const (&str)[N]) noexcept : m_buffer{new char[N]}, m_size(N - 1) { std::copy_n(str, m_size + 1, m_buffer); }
  // String(char const* str) noexcept : m_size{strlen(str)} { // Or use strlen()
  // // from the module std.compat
  //   m_buffer = new char[m_size + 1]; // +1 for last null termination char
  //   std::copy_n(str, m_size + 1, m_buffer);
  //   // memcpy(m_buffer, str, m_size + 1); // C-style way, you can also use
  //   // strcpy()
  // }
  String(String const& other) noexcept : m_buffer{new char[other.m_size + 1]}, m_size(other.m_size) { // Copy Consturcor
    std::copy_n(other.m_buffer, m_size + 1, m_buffer);
    // The shallow copy is like 'memcpy(this, &other, sizeof(String));'
  }
  // String(const String& other) = delete; // Or you can just prevent this object
  // to do copy operation
  ~String() { delete[] m_buffer; }
  char& operator[](std::size_t idx) const noexcept { return m_buffer[idx]; }
  // make <<() to be a fried so it can access private variables in this object
  friend std::ostream& operator<<(std::ostream& stream, String const& str) noexcept;
};
std::ostream& operator<<(std::ostream& stream, const String& str) noexcept { return stream << str.m_buffer; }
int main() {
  String first_str{"Cherno"};
  String second_str{first_str};
  second_str[2] = 'a';
  std::cout << first_str << '\n';
  std::cout << second_str << '\n';
}
```

## Dynamic Arrays (`std::vector`)

Vectors in C++ is not mathematical vector, it's of dynamic arrays.

```cpp
import std;
struct Vertex {
  float x, y, z;
};
std::ostream& operator<<(std::ostream& stream, Vertex const& vertex) noexcept {
  return stream << vertex.x << ", " << vertex.y << ", " << vertex.z;
}
int main() {
  std::vector<Vertex> vertices;
  vertices.push_back({1, 2, 3}), vertices.push_back({4, 5, 6});
  // Using range based 'for loop' to iterate the object in dynamic array
  for (Vertex const& v : vertices) std::cout << v << '\n';
  vertices.erase(vertices.begin() + 1); // Remove the second object by using an
  // iterator
  vertices.clear(); // Or we can clean the whole dynamic array
}
```

### Optimizing the usage of std::vector

Two ways to reduce memory copy
```cpp
struct Vertex {
  float x, y, z;
  constinit static int copy_count;
  constexpr Vertex(float x, float y, float z) noexcept : x(x), y(y), z(z) {}
  // Copy Constructor, used to capture copied times
  Vertex(Vertex const& v) noexcept : x(v.x), y(v.y), z(v.z) { std::println("Copied {} times", ++copy_count); }
};
constinit int Vertex::copy_count{};
int main() {
  std::vector<Vertex> vertices_bad;
  vertices_bad.push_back({1, 2, 3}); // 1 copy to store
  // Trigger rearrange, new size is current_elements x 2, which is 2 x Vertex
  vertices_bad.push_back({4, 5, 6}); // 1 copies to rearrange + 1 copy to store
  // Trigger rearrange, now reserved 4 x Vertex
  vertices_bad.push_back({7, 8, 9});    // 2 copies to rearrange + 1 copy to store
  vertices_bad.push_back({10, 11, 12}); // 1 copy to store
  // Trigger rearrange, new reserved 8 x Vertex
  vertices_bad.push_back({13, 14, 15}); // 4 copies to rearrange,  1 copy to store
  vertices_bad.push_back({16, 17, 18}); // 1 copy to store
  vertices_bad.push_back({19, 20, 21}); // 1 copy to store
  vertices_bad.push_back({22, 23, 24}); // 1 copy to store
  // Trigger rearrange, new reserved 16 x Vertex
  vertices_bad.push_back({25, 26, 27}); // 8 copies to store, 1 copies to store, total 24
  // Each time push_back() will do 1 copy operation to store the Vertex to vector,
  // and each push back may let vector do memory rearrange if reserved memory is
  // full, which copies previous objects in dynamic array into new memory area.

  std::println("vertices good:");
  std::vector<Vertex> vertices_good;
  vertices_good.reserve(4); // 1. Use reserver() to prevent memory rearrange.
  vertices_good.emplace_back(1, 2, 3); // 2. Replace push_back() with
  vertices_good.emplace_back(4, 5, 6); // emplace_back() to prevent parameter
  vertices_good.emplace_back(7, 8, 9); // copy, it acts as a proxy to process your
  vertices_good.emplace_back(10, 11, 12); // provided parameters into elements
  // constructor.
}
```

## Using Libraries in C++

Using GLFW as example.
- Visual Studio
  1. Create a folder called "Dependencies" under your project directory and then put the library into it.
     ```plaintext
     C:\Users\USERNAME\source\repos\Your_Project_Directory\Dependencies\
     -> GLFW\
       -> include\GLFW\
         glfw3.h
         ...
       -> lib-vc2015\
         glfw3.dll
         glfw3.lib
         glfw3.dll.lib
      ```
   2. Open project settings:
      &rarr;Configuration: All Configuration
      &rarr;C/C++&rarr;Additional Include Directories: `$(SolutionDir)\Dependencies\GLFW\include`
      &rarr;Linker&rarr;General&rarr;Additional Library Directories: `$(SolutionDir)\Dependencies\GLFW\lib-vc2015`

### Static linking

Static linking happens at compile time, the lib integrates into executable or a dynamic library

Visual Studio
1. Open project setting
   &rarr;Linker&rarr;Input&rarr;Additional Dependencies: `glfw3.lib;xxxxxx;balabala;...`
2. Static Link
   ```cpp
   // Main.cpp
   #include <GLFW/glfw3.h> // Quoted headers are in this project; angular
   // bracket headers are from external library
   // Or 'extern "C" int glfwInit();' // TODO: Review this episode
   // Since GLFW is actually a C library so we need `extern "C"`
   int main() {
     int result{glfwInit()};
     std::println("{}", result);
   }
   ```

### Dynamic linking

Dynamic linking happens at runtime

- Some libraries like GLFW supports both static and dynamic linking in a single header file.
- `glfw3.dll.lib` is basically a series of pointers to `glwfw3.dll`
- Code is basically as same as static linking.

Visual Studio
1. Open project settings:
   &rarr;Linker&rarr;Input&rarr;Additional Dependencies: `glfw3.dll.lib;xxxxxx;balabala;...`
2. Put `glfw3.dll` to the same folder as your executable file (i.e: `$(SolutionDir)\Debug`)
3. In fact, to call a function in dynamic library, it needs a prefix called `__declspec(dllimport)`
   If you explore `glfw3.h` you will see there is a prefix `GLFWAPI` in every function's definition:
   ```cpp
   /* We are calling GLFW as a Win32 DLL */
   #define GLFWAPI __declspec(dllimport)
   ```
   So **you need to define a Macro** in VS:
   Open your project setting:
   &rarr;C/C++&rarr;Preprocessor&rarr;Preprocessor Definitions: `GLFW_DLL;xxxxx;bababa...`
   
   But why it seems still work properly without the `dllimport` prefix?
   In modern windows, `dllimport` is not needed for functions, but `dllimport` is still needed for C++ classes and global variables.

## Making and Working with Libraries in C++ (Multiple Projects in Visual Studio)

1. Visual Studio Setup:
   1. Create one solution with 2 projects: "Game" and "Engine",
   2. Project "Game":
      General&rarr;Project Defaults&rarr;Configuration Type: Application (.exe)
      &rarr;C/C++&rarr;General&rarr;Additional include Directories: `$(SolutionDir)\Engine\src;`
   3. Project "Engine":
      General&rarr;Project Defaults&rarr;Configuration Type: Static library (.lib)
   4. Right click on projects "Game" &rarr;Add&rarr;Reference&rarr;Select project "Engine"
2. Code for project "Engine":
   ```cpp
   // Your_Project_Directory\src\Engine.h
   #pragma once
   namespace engine {
     void print_message();
   }
   // Your_Project_Directory\src\Engine.cpp
   #include "Engine.h"
   #include <iostream>
   namespace engine {
     void print_message() { std::println("Hello Game!"); }
   }
   ```
3. Code for project "Game":
   ```cpp
   // Your_Project_Directory\src\Application.cpp
   #include "Engine.h"
   int main() { engine::print_message(); }
   ```

## How to Deal with Multiple Return Values in C++

Example scenario: We have a function called `parse_shader()`, it needs to return two strings.

- Return a struct:
  ```cpp
  import std;
  struct ShaderProgramSource {
    std::string vertex_source;
    std::string fragment_source;
  };
  ShaderProgramSource parse_shader() {
    // ... (Some statements that process result 'vs' and 'fs')
    std::string vs, fs;
    return {vs, fs};
  }
  ```
- Use reference parameter (Probably one of the most optimal ways)
   ```cpp
   import std;
   void parse_shader(std::string& out_vertex_source, std::string& out_fragment_source) {
     // ... (Some statements that process result 'vs' and 'fs')
     std::string vs, fs;
     std::tie(out_vertex_source, out_fragment_source) = std::tuple{vs, fs};
   }
   // Or use pointer parameter if you want to pass nullptr (ignore the output)
   void parse_shader2(std::string* outVertexSource, std::string* outFragmentSource) {
     std::string vs, fs;
     if (outVertexSource) *outVertexSource = vs;
     if (outFragmentSource) *outFragmentSource = fs;
   }
   int main() {
     std::string vertex_source, fragment_source;
     parse_shader(vertex_source, fragment_source);
     parse_shader2(nullptr, &fragment_source);
   }
   ```
- Return a `std::array` or `std::vector`

  The different is primarily that the arrays can be created on stack whereas vectors gonna store its underlying storage on heap.
  So technically returning a standard array would be faster.
  ```cpp
  import std;
  std::array<std::string, 2> parse_shader() {
    std::string vs, fs;
    // ... (Some statements that process result 'vs' and 'fs')
    return {vs, fs};
  }
  ```
- Using `std::tuple` and `std::pair`
  ```cpp
  import std;
  std::tuple<std::string, int> create_person() { return {"Cherno", 24}; }
  std::pair<std::string, int> create_person2() { return {"Proteus", 24}; }
  int main() {
    auto person{create_person()}; // std::tuple can store more than two
    // elements
    auto& name{std::get<0>(person)}; // Get values in std::tuple
    int age{std::get<1>(person)};
  
    // std::pair is a little bit faster than tuple
    auto [name2, age2]{create_person2()}; // C++17 structure binding
  }
  ```

## Templates

Templates can improve code reuse rate and reduce duplicate code (e.g. function overload), the essence of template is similar to macros.

1. Template type
  ```cpp
  // How templates specificalize to create methods is based on the usage of
  // them. That is, if nobody calls the templated function, it's code will not
  // exist in compiled file, even if there is a grammatical error in templated
  // function code, it will still compile successfully.
  import std;
  template <class T> // Exactly same as 'template<typename T>'
  void print(T value) { std::println("{}", value); }
  int main() {
    print(5);      // Auto deducing
    print<int>(5); // For newbie, it's a good manner to specifying the type
    // explicitly
    print<char const*>("Hello");
    print<float>(5.5f);
  }
  ```
2. template argument
   ```cpp
   import std;
   template <class T, int N> // Multiple template targets can be in one template
   // definition, 'N' is a non-type template argument
   class Array {
   private:
     T m_arr[N];
   public:
     constexpr int get_size() const noexcept { return N; }
   };
   int main() {
     constexpr Array<int, 5> arr{}; // It will generate the following code:
     // class Array {
     // private:
     //   int m_arry[5];
     // public:
     //   constexpr int get_size() const noexcept { return 5; }
     // };
     std::println("{}", arr.get_size());
   }
   ```
3. The keyword `typename` clarify something that is a type.

   C++20 makes `typename` optional on where nothing but a dependent type name can appear
   ```cpp
   template <class T> T::U f(); // Return type
   template <class T> void f(typename T::U); // Ill-formed in global scope, without 'typename', 'T::U' would be evaluated right now as 'void'
   template <class T>
   struct S {
     T::U r; // Member type
     T::P f(T::P p) { // But Ok in class scope, argument type of a methods
       return static_cast<T::R>(p); // Type in casts
     }
   };
   ```
4. Non-type template parameter (C++20)
   ```cpp
   template<class T> struct X { constexpr X(T) {} };
   template <X x> struct Y {}; // Non-type template parameter
   Y<0> y; // Y<X<int>(0)>
  
   template <typename T, std::size_t N> struct S2 { T data[N];}; // Array of
    // dependent bound
   {% raw %}S2 s{{1, 2, 3, 4, 5}};{% endraw %}
   ```
5. User-defined deduction guides (C++17)

   **Only works for class (`class`, `struct`, `union`).**

   Sometimes, template parameters of a class template could not be deduced from a constructor call. For example, elements' type in a container.
   ```cpp
   template <class T>
   struct Container {
     Container(T t) {}
     template <class Iter> Container(Iter begin, Iter end) {}
   };
   template <class Iter> // Guides compiler how to deducing elements type
   Container(Iter b, Iter e) -> Container<typename std::iterator_traits<Iter>::value_type>;
   
   std::vector<double> v{1, 2};
   Container w{v.begin(), v.end()}; // Deduces Container<double>
   ```
6. Abbreviated function template (C++20)
   ```cpp
   void f1(auto); // Same as template<class T> void f1(T)
   void f2(Concept1 auto); // Can be constrained by concept
   template<> f1(int); // Can be specialized like normal
   ```

### Ways to Print Type Name

```cpp
#include <cxxabi.h>
import std;
template <typename T> // One way
std::string type_name() noexcept {
  using TRR = std::remove_reference<T>::type;
  std::unique_ptr<char, std::function<void(void*)>> p_demangled_name{abi::__cxa_demangle(typeid(TRR).name(), nullptr, nullptr, nullptr),
                                                                     std::free};
  std::string ret{p_demangled_name != nullptr ? p_demangled_name.get() : typeid(TRR).name()};
  if (std::is_const<TRR>::value) ret += " const";
  if (std::is_volatile<TRR>::value) ret += " volatile";
  if (std::is_lvalue_reference<T>::value) ret += "&";
  else if (std::is_rvalue_reference<T>::value) ret += "&&";
  return ret;
}
template <typename T> // Another way using function name with signature
consteval std::string_view type_name2() noexcept {
  std::string_view capt{std::source_location::current().function_name()}; // Or "__PRETTY_FUNCTION__" for < c++20
  // e.g. "static_string type_name2() [T = const int &]"
  return {capt.cbegin() + capt.find('=') + 2, capt.cend() - 1};
}
int& foo_lref();
int&& foo_rref();
int foo_value();
int main() {
  int i = 0;
  int const ci = 0;
  std::println("decltype(i) is {}", type_name<decltype(i)>());
  std::println("decltype((i)) is {}", type_name<decltype((i))>());
  std::println("decltype(ci) is {}", type_name<decltype(ci)>());
  std::println("decltype((ci)) is {}", type_name<decltype((ci))>());
  std::println("decltype(static_cast<int&>(i)) is {}", type_name<decltype(static_cast<int&>(i))>());
  std::println("decltype(static_cast<int&&>(i)) {}", type_name<decltype(static_cast<int&&>(i))>());
  std::println("decltype(static_cast<int>(i)) {}", type_name<decltype(static_cast<int>(i))>());
  std::println("decltype(foo_lref()) {}", type_name<decltype(foo_lref())>());
  std::println("decltype(foo_rref()) {}", type_name<decltype(foo_rref())>());
  std::println("decltype(foo_value()) {}", type_name<decltype(foo_value())>());
}
```

### Concepts

```cpp
import std;
template <typename T> concept Addable = requires(T a, T b) { a + b; };
template <typename T> concept Dividable = requires(T a, T b) { a / b; };
template <typename T> concept DivAddable = Addable<T> && Dividable<T>;

template <typename T, typename U> concept ExampleReq = requires(T x, U) {
  // simple requirement: expression must be valid
  x++;
  *x;
  // type requirement: T::value_type type must be a valid type
  typename T::value_type;
  typename std::vector<T>;
  // compound requirement: {expression}[noexcept][-> Concept];
  // {expression} -> Concept<A1, A2, ...> is equivalent to requires
  // Concept<decltype((expression)), A1, A2, ...>
  { *x } noexcept; // dereference must be noexcept
  { *x } noexcept -> std::same_as<typename T::value_type>; // dereference must
  // return T::value_type nested requirement: requires ConceptName<...>;
  requires Addable<T>;
};

template <typename T> requires Addable<T> // Use requires clause to constrain
T add(T a, T b) { return a + b; }
template <Addable T> // Directly use concept as template parameter (cleaner way)
T add2(T a, T b) { return a + b; }

template <typename T>
consteval bool is_addable() { // requires-expression render to a bool at compile-time
  if (Addable<T>) return true; // Same as
  // if (requires(T a, T b) { a + b; }) return true;
  else return false;
}
````

Some STD concepts:
```cpp
import std;
// Some STD concepts
template <std::integral T>
void print_concept() { std::println("Integral matched"); }

template <std::integral T> requires std::is_unsigned_v<T>
void print_concept() { std::println("Unsigned integral matched"); }

template <std::floating_point T>
void print_concept() { std::println("Floating point matched"); }

template <std::floating_point T> requires(sizeof(T) == 8)
void print_concept() { std::println("Doubled Floating point matched"); }

template <std::integral_constant T>
void print_concept() { std::println("Integral constant matched"); }
```

Narrowing conversion check using Concept:
```cpp
import std;
template <typename From, typename To> concept narrowing = !requires(From f) { To{f}; };
static_assert(!narrowing<std::int8_t, std::int16_t>);
static_assert(!narrowing<std::uint8_t, std::int16_t>);
static_assert(!narrowing<float, double>);
static_assert(narrowing<double, float>);
static_assert(narrowing<int, uint32_t>);
```

### Template Template Parameter & CRTP & Explicit object parameter

Curiously Recurring Template Pattern (CRTP): A derived class derives the base class with itself as a template argument. To make base class use derived class's methods without `virtual`:

```cpp
import std;
template <typename T> concept Addable = requires(T a, T b) { a + b; };
// Template template parameter can be constrained (Though not necessary)
template <template <Addable> typename Templ_Deri, typename T>
// Requires clause also works
// template <template <typename T> requires Addable<T> typename Templ_Derived, typename T>
class Base {
  friend Templ_Deri<T>;
private:
  constexpr Base() noexcept {}
public:
  void print_derived_add(T a, T b) const noexcept { std::println("{}", static_cast<Templ_Deri<T> const&>(*this).add(a, b)); }
};
template <Addable T>
class Derived : public Base<Derived, T> {
public:
  constexpr T add(T a, T b) const noexcept { return a + b; }
};

// Deducing explicit object parameter (deducing 'this', C++23)
struct Base2 {
  void name(this auto&& self) noexcept { self.impl(); } // Same as
  // template <typename Self> void name(this Self&& self) { self.impl(); }
};
struct D1 : public Base2 {
  void impl() const noexcept { std::println("D1::impl()"); }
};
struct D2 : public Base2 {
  void impl() const noexcept { std::println("D2::impl()"); }
};

int main() {
  Derived<int>().print_derived_add(1, 2);
  D1{}.name(), D2{}.name();
}
```

### SFINAE

*"Substitution Failure Is Not An Error"*, compiler will continue to find suitable template.

If statement in template using SFINAE
```cpp
import std;
template <bool Cond, typename IfTrue, typename IfFalse>
struct conditional { using type = IfTrue; };

template <typename IfTrue, typename IfFalse>
struct conditional<false, IfTrue, IfFalse> { using type = IfFalse; }; // This
// will has higher priority
template <bool Cond, class IfTrue, class IfFalse>
using conditional_t = conditional<Cond, IfTrue, IfFalse>::type;

static_assert(std::same_as<conditional_t<true, int, float>, int>);
```

Narrowing conversion check using SFINAE
```cpp
template <typename From, typename To, typename = void>
struct is_narrowing : std::true_type {};
template <typename From, typename To> // A template specification of the above,
// 'To{std::declval<From>()}' is ill-formed in case of narrowing cast, so will
// prevent match this template
struct is_narrowing<From, To, std::void_t<decltype(To{std::declval<From>()})>> : std::false_type {};

static_assert(!is_narrowing<std::int8_t, std::int16_t>::value);
static_assert(!is_narrowing<std::uint8_t, std::int16_t>::value);
static_assert(!is_narrowing<float, double>::value);
static_assert( is_narrowing<double, float>::value);
static_assert( is_narrowing<int, uint32_t>::value);
```

A skillful implementation of custom `std::formatter`. `parse()` is a template method, since it's `constexpr` specified, any possible cases that result a `throw` will be filtered in a SFINAE way.
```cpp
import std;
struct QuotableString : std::string_view {};
template <typename CharT>
struct std::formatter<QuotableString, CharT> {
  bool quoted{false};
  template <class ParseContext>
  constexpr ParseContext::iterator parse(ParseContext& ctx) {
    auto it{ctx.begin()};
    if (it == ctx.end()) return it;
    if (*it == '#') (quoted = true), ++it;
    if (it != ctx.end() && *it != '}') // How could this pass the compile?
      throw std::format_error("Invalid format args for QuotableString.");
    return it;
  }
  // template <class FmtContext> // Way 1: Using std::ostringstream
  // FmtContext::iterator format(QuotableString s, FmtContext& ctx) const {
  //   std::ostringstream out;
  //   if (quoted) out << std::quoted(s);
  //   else out << s;
  //   return std::ranges::copy(std::move(out).str(), ctx.out()).out;
  //   // std::move is not necessary in C++20 since it'll do type deducing
  // }
  template <class FmtContext> // Way 2: Using std::format_to
  constexpr FmtContext::iterator format(QuotableString s, FmtContext& ctx) const noexcept { // constexpr version
    return quoted ? std::format_to(ctx.out(), "{:?}", static_cast<std::string_view>(s)) : std::ranges::copy(s, ctx.out()).out;
  }
};
int main() {
  QuotableString a("be"), a2(R"( " be " )");
  QuotableString b("a question");
  std::cout << std::format("To {0} or not to {0}, that is {1}.\n", a, b);
  std::cout << std::format("To {0:} or not to {0:}, that is {1:}.\n", a, b);
  std::cout << std::format("To {0:#} or not to {0:#}, that is {1:#}.\n", a2, b);
}
```

## Stack vs Heap Memory in C++

Ignore...

## Macros in C++

Macros do text replace at preprocessor stage
 ```cpp
 #include <iostream>
 #define WAIT std::cin.get()
 int main() {
   WAIT;
 }
 ```

Macros function and combine with the environment, environment variables can be defined at: Project settings&rarr;C/C++&rarr;Preprocessor&rarr;Preprocessor Definitions
```cpp
import std;
#ifdef PR_DEBUG
#define LOG(x) std::println("{}", x)
#elif defined(PR_RELEASE)
#define LOG(x) // Do nothing
#endif
int main() {
  LOG("Hello");
}
```

Variadic macros
```cpp
import std;
#define LOG1(...) \
  __VA_OPT__(std::printf(__VA_ARGS__);)
int main() {
  LOG1(); // '__VA_OPT__' allows optional '__VA_ARGS__'
  LOG1("number is 12\n"); // '__VA_OPT__' also allows to omit the trailling comma
  // when '__VA_ARGS__' are empty
  LOG1("number is %d\n", 13);
}
```

## The `auto` Keyword

Be careful with `auto`:
```cpp
import std;
consteval std::string get_name() noexcept { return "Cherno"; }
// consteval char const* get_name() noexcept { return "Cherno"; }
int main() {
  auto name{get_name()};
  std::size_t a{name.size()}; // Call a type specific method size(), if thereturn type of get_name() changed to 'char*' , this will be broken
  std::println("{}", a);
}
```

`auto`, `using` can reduce type length
```cpp
import std;
class Device {};
class DeviceManager {
  using Device_t = std::unordered_map<std::string, std::vector<Device*>>;
private:
  Device_t m_devices;
public:
  Device_t const& GetDevices() const { return m_devices; }
};
int main() {
  DeviceManager dm;
  // The type is too messy
  std::unordered_map<std::string, std::vector<Device*>> const& devices{dm.GetDevices()};
  using DeviceMap = std::unordered_map<std::string, std::vector<Device*>>; // Use
  // 'using' or 'typedef' to make alias
  DeviceMap const& devices2{dm.GetDevices()};
  auto const& devices3{dm.GetDevices()}; // Or use auto
}
```

## Static Arrays in C++ (std::array)

TODO

## Function Pointers

1. Ways that define a function pointer:
   ```cpp
   import std;
   void hello_world(int a) noexcept { std::println("Hello World! Value: {}", a); }
   int main() {
     auto const f1{hello_world}; // auto deducing
     void (*const f2)(int){hello_world}; // C-style function pointer
     using Balabala = std::function<void(int)>; // Using alias and std::function
     // typedef void (*Balabala)(int); // Or C-style typedef
     Balabala const& f3{hello_world};
     f1(1), f2(2), f3(3);
   }
   ```
2. A simple usage - the 'for each' function:
   ```cpp
   import std;
   template <typename E>
   void print_value(E value) noexcept { std::println("Value: {}", value); }
   
   template <typename Cont, typename Func> requires requires(Func func) { static_cast<std::function<void(typename Cont::value_type)>>(func); }
   void for_each(Cont const& cont, Func func) noexcept {
     for (typename Cont::value_type const& v : cont) func(v);
   }
   int main() {
     std::vector vec{1, 5, 4, 2, 3};
     for_each(vec, print_value<int>);
     // Or use a lambda (with template parameter in C++20)
     for_each(vec, []<typename E>(E value) { std::println("Value: {}", value); });
   }
   ```

## Lambdas in C++

A lambda is basically a little throwaway function that you can write and assign to a variable quickly.

1. How to put outside variables into lambda function

   `[=]`: Pass everything in by value, the pass in variables is independent of the outside.

   `[&]`: Pass everything in by reference.

   `[a]`: Pass `a` by value

   `[&a]`: Pass `a` by reference.
2. Use `mutable` keyword to allow modifying pass-in variables
   ```cpp
   import std;
   int main() {
     int a{8};
     auto f{[=]() mutable { a = 5; std::println("Value: {}",a); }};
     f();
     std::println("Value: {}", a); // x is still 8, because [=] just copy value
     // into the lambda.
   }
   ```
3. We need to use `std::function` instead of C-style raw function pointer if lambda has pass in variables (stateful lambda).
   ```cpp
   void for_each(std::vector<int> const& values, std::function<void(int)> const& func) noexcept {
     for (int const i : values) func(i);
   }
   int main() {
     std::vector values{1, 2, 3, 4, 5};
     int state{};
     // This lambda cannot cast to C-style void(*callback)(int)
     auto callback{[&](int value) { std::println("Current state: {}, Value: {}", state, value); }};
     state = 1;
     for_each(values, callback);
   }
   ```
4. Usage of `std::find_if` (returns an iterator to the first element when callback function returns true)
   ```cpp
   int main() {
     std::vector values{1, 5, 4, 2, 3};
     auto iterator{std::find_if(values.begin(), values.end(), [](int value) { return value > 3; })};
     std::println("First element that > 3: {}", *iterator);
   }
   ```
5. Capturing parameter packs in lambda
   ```cpp
   import std;
   constexpr int add(int a, int b) noexcept { return a + b; }
   template <typename F, typename... Args>
   constexpr auto invoke(F&& f, Args&&... args) noexcept { // C++20 improved
   // capturing parameter packs in lambda
     return [f = std::forward<F>(f), ... f_args = std::forward<Args>(args)]() constexpr noexcept { return f(f_args...); };
     // '...' is like says "take whatever on the life and unpack it accordingly"
     // If the parms pack f_args is '[1, 2]', compiler will expand 'f(args...)'
     // to 'f(1, 2)'; as well as expand 'f(args)...' to 'f(arg1), f(arg2)'
   }
   int main() { std::println("{}", invoke(add, 1, 2)()); }
   ```

## Namespaces in C++

Use Namespace to
1. Avoid naming conflict: `apple::print()`, `orange::print()`
2. Avoid C library like naming: `GLFW_initialize` to `GLFW::initialize`

We can set to use only specific symbol in a namespace
```cpp
import std;
namespace apple {
static char const* s_txt;
void print(char const* txt) { s_txt = txt, std::println("{}", txt); }
void print_again() { std::println("{}", s_txt); }
}; // namespace apple
void print() { std::println("print from global"); }
int main() {
  using apple::print; // Use namespace in a limited range
  print("Hello");
  apple::print_again(); // We still need 'apple::' to call print_again()
  ::print(); // If want to call functions in global
}
```

Nested namespaces can be shortened using alias:
```cpp
import std;
namespace apple::functions {
void print(char const* txt) { std::println("{}", txt); }
} // namespace apple::functions
int main() {
  namespace a = apple::functions;
  a::print("Hello");
}
```

### Why don't "using namespace std"

Absolutely don't use `using namespace` in header files.
If you must use `using namespace`, please use it in a small scope as possible.

For example, a serious issue of implicit conversion:
```cpp
import std;
namespace apple {
void print(std::string const& txt) noexcept { std::println("{}", txt); }
} // namespace apple
namespace orange {
void print(char const* txt) noexcept {
  std::string tmp{txt};
  std::reverse(tmp.begin(), tmp.end());
  std::println("{}", tmp);
}
} // namespace orange
using namespace apple;
using namespace orange;
int main() {
  print("Hello"); // Which one will get called?
  // Answer: the orange::print() will be called, because the type of "Hello" is
  // 'char*'
}
```

## Threads and Coroutines

If we want to do something else when we are calling functions that will block the current thread, we can use `std::threads` (or coroutines in C++20).

- A `std::thread` should have either `join()` or `detach()` called otherwise it will call `std::terminate()` in its destructor.

Here is an example:
We create a thread that will do loop on outputting "Working...",
and simultaneously the main() function is waiting for user input.
```cpp
import std;
int main() {
  std::println("[Main] tid={}", std::this_thread::get_id());
  bool is_finish{false};
  // In a async operation, there are ways to store the result of a thread's
  // processing: 'std::promise' is used by the producer/writer, while
  // 'std::future' is used by the consumer/reader, the latter don't have ability
  // to set or write.
  std::promise<std::string> promise;
  std::future<std::string> future{promise.get_future()};
  std::thread worker([&is_finish, promise = std::move(promise)]() mutable { // As
  // soon as we create thread instance, it's going to immediately kick off
    std::println("[thread] Started, tid={}", std::this_thread::get_id());
    while (!is_finish) {
      std::println("Working...");
      std::this_thread::sleep_for(std::chrono::seconds(1));
      // using namespace std::literals::chrono_literals; // Or use alias for
      // // convenience
      // std::this_thread::sleep_for(1s);
    }
    promise.set_value("From thread: I'm completed!");
  }); // Since the ownership of the 'promise' has moved to the thread 'worker',
  // we can no longer use it in this function
  std::cin.get();
  is_finish = true;
  worker.join(); // Let main thread to wait for this thread (block main thread)
  std::println("Finished. Get values from thread: {}", future.get());
}
```

### Coroutines

```cpp
template <typename T> // Promise
struct Co {
  struct promise_type;
  std::coroutine_handle<promise_type> handle;
  struct promise_type {
    int m_count{};
    T m_ret;
    Co get_return_object() { return Co{.handle = std::coroutine_handle<promise_type>::from_promise(*this)}; }
    auto initial_suspend() { return std::suspend_never{}; } // Called when
    // coroutine object instantiated, can either return 'std::suspend_always',
    // 'std::suspend_never', or construct a custom awaiter class
    auto final_suspend() const noexcept { return std::suspend_always{}; } // Called
    // when coroutine function completed
    void unhandled_exception() const { std::terminate(); }
    // void return_void() { std::println("[promise_type] return_void"); } // Called
    // by 'co_return'
    void return_value(T value) { m_ret = value; } // Called by 'co_return <value>'
    // , can't coexist with 'return_void()'
    auto yield_value(int value) { // Called by 'co_yield', normally you should
    // choose either 'co_yield' or 'co_await'
      m_count = value;
      return std::suspend_always{};
    }
    auto await_transform(std::function<T()> const& func) const {
      struct Awaiter {
        std::future<T> m_future;
        std::thread m_thr;
        bool await_ready() { return false; } // Called by 'co_await', return
        // false to suspend

        // Called at suspend
        void await_suspend(std::coroutine_handle<>) { std::println("[Awaiter] await_suspend"); }
        T await_resume() { // Called at resume
          std::println("[Awaiter] Thread block? Main thread tid#{}", std::this_thread::get_id());
          return m_future.get();
        }
      };
      std::promise<T> promise;
      std::future<T> future{promise.get_future()};
      std::thread thr([&func, promise{std::move(promise)}]() mutable {
                      std::println("[co_await] tid#{}", std::this_thread::get_id());
                      T value{func()};
                      promise.set_value(value); });
      thr.detach();
      return Awaiter{std::move(future), std::move(thr)}; // 'std::move()' cast to
      // rvalue reference so we call the move constructor of std::future and
      // std::thread, otherwise copy constructor will create duplicate thread
      // and access the same promise object
    }
  };
};
int main() {
  auto co{[]() -> Co<int> { // Coroutine
    std::println("[run] before co_await");
    int ret{co_await []() { std::this_thread::sleep_for(std::chrono::seconds(2)); return 114514; }}; // Dummy function for coroutine to run
    std::println("[run] after co_await");
    co_yield 1;
    std::println("[run] after co_yield");
    co_return ret;
    std::println("[run] after co_return");
  }()};

  std::println("[main] tid#{}", std::this_thread::get_id());
  for (int i{1}; !co.handle.done(); i++) {
    std::println("\n[main]resume {} times", i);
    std::println("[main]m_count {}", co.handle.promise().m_count);
    co.handle.resume();
  }
  std::println("[main] get returned value: {}", co.handle.promise().m_ret);
  co.handle.destroy(); // Don't forget to destory, or memory leak could occur.
}
```

## Timing

Make a timer to count time-consuming
```cpp
template <class Res = std::chrono::milliseconds>
class Timer {
  using Clock = std::conditional_t<std::chrono::high_resolution_clock::is_steady,
                                   std::chrono::high_resolution_clock, std::chrono::steady_clock>;
private:
  std::chrono::time_point<Clock> const m_start_time;
  std::chrono::time_point<Clock> m_last_time;
public:
  Timer() noexcept : m_start_time(Clock::now()), m_last_time{Clock::now()} { std::println("Timer start!"); }
  ~Timer() {
    std::println("Time destructored, life time {}", std::chrono::duration_cast<Res>(Clock::now() - m_start_time));
  }
  inline void count() noexcept {
    std::println("Time took: {}", std::chrono::duration_cast<Res>(Clock::now() - m_last_time));
    // To cast time point, you can use std::chrono::time_point_cast<>()
    // To get the count from UNIX Epoch: Clock::now().time_since_epoch().count()
    m_last_time = Clock::now();
  }
  inline void renew() noexcept { m_last_time = Clock::now(); }
};
int main() {
  []() {
    Timer timer; // The timer will be deleted automatically when run out of the
    // scope
    std::this_thread::sleep_for(std::chrono::milliseconds(1145)); // Sleep for
    // 114514ms
  }();
}
```

## Multidimensional Arrays

```cpp
import std;
int main() {
  int** a2d{new int*[20]}; // 2D array, stores type 'int*'
  for (int i{}; i < 20; i++) { // Initiate a 20x30 2D array
    a2d[i] = new int[30];
    for (int j{}; j < 30; j++) a2d[i][j] = i * 30 + j; // Given values
  }
  for (int i{}; i < 20; i++) { // Print the 2D array
    std::print("{:3}", a2d[i][0]);
    for (int j{1}; j < 30; j++) std::print(" {:3}", a2d[i][j]);
    std::println("");
  }
  for (int i{}; i < 20; i++) delete[] a2d[i]; // First release the sub array
  delete[] a2d;

  // 3D array, you can imagine a cube with size 2x3x4 (row, column, height)
  int*** a3d{new int**[2]};
  for (int i{}; i < 2; i++) {
    a3d[i] = new int*[3];
    for (int j{}; j < 3; j++) {
      a3d[i][j] = new int[4];
      for (int k{}; k < 4; k++) a3d[i][j][k] = k * 2 * 3 + i * 3 + j;
    }
  }
  // Now print the 3D array by slicing the heights
  std::println("Layer1       Layer2     Layer3      Layer4");
  for (int i{}; i < 2; i++) { // Row
    for (int k{}; k < 4; k++) { // Height
      std::print("{:2}", a3d[i][0][k]); // Column 0
      for (int j{1}; j < 3; j++) std::print(" {:2}", a3d[i][j][k]); // Column 1, 2
      std::print("    ");
    }
    std::println("");
  }
  // When you want to delete this array, you have to go through inner array and
  // delete all of those arrays from inside to out
  for (int i{0}; i < 2; i++) {
    for (int j{0}; j < 3; j++) delete[] a3d[i][j];
    delete[] a3d[i];
  }
  delete[] a3d;
}
```

The most issue is that the Multidimensional Arrays will result memory fragmentation. When iterating the array we have to jump to another location to read or write that data, and that results probably a cache miss which means that we're wasting time fetching data from RAM.

One of the most feasible thing you can do is just store them in a single dimensional array:
```cpp
import std;
int main() {
  int* arr{new int[4 * 5]};
  for (int i{}; i < 4 * 5; i++) arr[i] = i;
  for (int i{}; i < 4 * 5; i++)
    switch (i % 5) {
    case 4: std::println("{:3}", arr[i]); break; // Start of a row
    default: std::print(" ");
    case 0: std::print("{:2}", arr[i]); // End of a row
    }
  // C++23's std::mdspan can reinterprets a contiguous sequence as a
  // multidimensional array
  auto ms4x5{std::mdspan(arr, 4, 5)}; // View data as a 5x5 array
  auto ms2x10{std::mdspan(arr, 2, 10)};
  std::println("std::mdspan 4x5");
  for (std::size_t i{}; i != ms4x5.extent(0); i++) { // extents describe the
  // length of a specific dimensional rank (depth)
    std::print("{:2}", ms4x5[i, 0]);
    for (std::size_t j{1}; j != ms4x5.extent(1); j++) std::print("{:3}", ms4x5[i, j]);
    std::println("");
  }
  std::println("std::mdspan 2x5");
  for (std::size_t i{}; i != ms2x10.extent(0); i++) {
    std::print("{:2}", ms2x10[i, 0]);
    for (std::size_t j{1}; j != ms2x10.extent(1); j++) std::print("{:3}", ms2x10[i, j]);
    std::println("");
  }
  delete[] arr;
}
```

## Sorting in C++

```cpp
import std;
int main() {
  std::vector values{3, 5, 1, 4, 2};
  std::sort(values.begin(), values.end()); // Time complexity nlog n
  for (int value : values) std::print(" {}", value);
  std::println("");

  // We can define sorting rule for std::sort(), Such as sorting by big to small
  std::sort(values.begin(), values.end(), [](int a, int b) noexcept { return a > b; });
  for (int value : values) std::print(" {}", value);
  std::println("");

  // Or force '1' to the last of array list
  std::sort(values.begin(), values.end(), [](int a, int b) {
    return b == 1 || (a != 1 && a < b); // Return false means swap a, b
  });
  for (int value : values) std::print(" {}", value);
  std::println("");
}
```

## Type Punning in C++

```cpp
import std;
struct Entity {
  int x, y;
};
int main() {
  Entity e{5, 8};
  int* position{reinterpret_cast<int*>(&e)}; // Type punning allows treat this struct as an size 2 int array
  std::println("{}, {}", position[0], position[1]);
  // More crazy usage
  int y{*reinterpret_cast<int*>(reinterpret_cast<char*>(&e) + 4)};
  std::println("{}", y);
}
```

## Unions in C++

Defined member in `union` means they all in same memory location, `union` is a common way to "Type Punning".
```cpp
import std;
struct Vector2 { float x, y; };
union Point {
  struct Vector4 { float x, y, z, w; };
  struct Vector2x2 { Vector2 xy, zw; };
  Vector4 vec4;
  Vector2x2 vec2x2;
};
int main() {
  Point pt{{1.0f, 2.0f, 3.0f, 4.0f}};
  std::println("[{}, {}, {}, {}]", pt.vec4.w, pt.vec4.x, pt.vec4.y, pt.vec4.z);
  std::print("[{}, {}]", pt.vec2x2.xy.x, pt.vec2x2.xy.y),
    std::println("[{}, {}]", pt.vec2x2.zw.x, pt.vec2x2.zw.y);
  std::println("{:-<14}", '-');
  pt.vec4.z = 500.0f;
  std::println("[{}, {}, {}, {}]", pt.vec4.w, pt.vec4.x, pt.vec4.y, pt.vec4.z);
  std::print("[{}, {}]", pt.vec2x2.xy.x, pt.vec2x2.xy.y),
    std::println("[{}, {}]", pt.vec2x2.zw.x, pt.vec2x2.zw.y);
}
```

> Type punning can do as the same result, but using union makes it more concise.

## Virtual Destructors

Virtual Destructors is really important if you are writing a base class, otherwise no one is able to safely delete the derived class. Without `virtual` qualifier, you are just adding a new destructor instead of overloading it.

```cpp
import std;
class Base {
public:
  Base() noexcept { std::println("Base Constructor"); }
  virtual ~Base() { std::println("Base Destructor"); }
};

class Derived : public Base {
public:
  Derived() noexcept { std::println("Derived Constructor"); }
  ~Derived() override { std::println("Derived Destructor"); }
};

int main() { delete new Derived(); } // If the polymorphic type lacks 'virturl',
// '~Derived()' will not be called
```

## Casting in C++

C++'s cast can do anything that C-style casts can do, those casts make you code more solid and looks better.

1. Static cast (compile-time checking).
2. Reinterpret cast (for Type Punning).
   - `reinterpret_case` can only perform conversions for pointers and references. e.g. If you want to reinterpret an `int` as a `double`:
  ```cpp
  int x{};
  double y{reinterpret_case<double&>(x)};
  ```
  - The `nullptr` or `0` is not guaranteed to yield the null pointer value of the target type, use `static_cast()` as a safer way for this purpose.
3. Dynamic cast (returns `nullptr` if casting is failed)
4. Const cast (Removes the const-ness from references or pointers that ultimately refer to something not constant)

```cpp
import std;
class Base {
public:
  Base() noexcept {}
  virtual ~Base() {}
};
class Derived : public Base {};
int main() {
  double value{5.5};
  auto lowered{static_cast<double>(static_cast<int>(value))}; // Static cast
  std::println("{}", lowered);

  auto p_base{std::make_unique<Base>()};
  auto p_descend_base{dynamic_cast<Derived*>(p_base.get())}; // Base class cannot
  // be dynamicaly casted to sub class
  if (!p_descend_base) std::println("Converting failed");
}
```

## Debug: Conditional and Action Breakpoints

Breakpoints can prevent recompile and save time.

- Condition Breakpoints: If only want the breakpoint to trigger under a certain condition.
- Action Breakpoints: Generally print something to the console when a breakpoint is hit

For details. Please [watch this video](https://www.youtube.com/watch?v=9ncNA6Co2Nk&list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb&index=70)

## Dynamic Casting in C++

If we force type casting a `Enemy` class to `Player` and access its data (functions, variables) that is unique to `Player`, the program will probably crash.

Dynamic Casting does some validation for us to ensure that cast is valid
```cpp
import std;
class Entity {
public:
  virtual ~Entity() = default; // At least one virtual method is need to make a class polymorphic
};
class Player : public Entity {};
class Enemy : public Entity {};
int main() {
  std::unique_ptr<Entity> actually_player{std::make_unique<Player>()};
  std::unique_ptr<Entity> actually_enemy{std::make_unique<Entity>()};

  // How does it know that actually_player is actually a Player and not an Enemy?
  // The way it does is stores runtime type information (RTTI), this does add an
  // overhead but it lets you do things like dynamic casting, be aware that RTTI
  // can be disabled (for clang it's '-fno-rtti')
  auto p0{dynamic_cast<Player*>(actually_player.get())};
  auto p1{dynamic_cast<Player*>(actually_enemy.get())}; // This will return null
  if (p0) std::println("p0 casted successfully");
  if (p1) std::println("p1 casted successfully");
}
```

## Benchmarking in C++ (how to measure performance)

Here we benchmark the performance of the `std::make_shared`, `new`, `std::make_unique`:
```cpp
import std;
template <class Res = std::chrono::microseconds>
class Timer {
  using Clock = std::conditional_t<std::chrono::high_resolution_clock::is_steady,
                                   std::chrono::high_resolution_clock, std::chrono::steady_clock>;
private:
  std::chrono::time_point<Clock> const m_start_time;
  std::chrono::time_point<Clock> m_last_time;
public:
  Timer() noexcept : m_start_time(Clock::now()), m_last_time{Clock::now()} { std::println("Timer start!"); }
  ~Timer() {
    std::println("Time destructored, life time {}", std::chrono::duration_cast<Res>(Clock::now() - m_start_time));
  }
  inline void count() noexcept {
    auto dur = std::chrono::duration_cast<Res>(Clock::now() - m_last_time);
    std::println("Time took: {:.3}ms ({})", dur.count() * 1e-3, dur);
    m_last_time = Clock::now();
  }
  inline void renew() noexcept { m_last_time = Clock::now(); }
};
int main() {
  struct Vector2 { float x, y; };
  Timer timer;
  std::println("Make Shared");
  {
    timer.renew();
    std::array<std::shared_ptr<Vector2>, 1000> vertices;
    for (auto& vertex : vertices) vertex = std::make_shared<Vector2>();
    timer.count();
  }
  std::println("New Shared");
  {
    timer.renew();
    std::array<std::shared_ptr<Vector2>, 1000> vertices;
    for (auto& vertex : vertices) vertex = std::shared_ptr<Vector2>(new Vector2());
    timer.count();
  }
  std::println("Make Unique");
  {
    timer.renew();
    std::array<std::unique_ptr<Vector2>, 1000> vertices;
    for (auto& vertex : vertices) vertex = std::make_unique<Vector2>();
    timer.count();
  }
}
```

Another example that compares custom implementation of cosine function with `std::cos`
```cpp
namespace custom {
constexpr double pow(double x, long n) noexcept {
  if (n > 0) return x * pow(x, n - 1);
  else return 1;
}
constexpr long fact(long n) noexcept {
  if (n > 1) return n * fact(n - 1);
  else return 1;
}
constexpr double cos(double x) noexcept {
  constexpr long precision{16L};
  double y{};
  for (auto n{0L}; n < precision; n += 2L) y += pow(x, n) / (n & 2L ? -fact(n) : fact(n));
  return y;
}
} // namespace custom
double gen_random() noexcept {
  static std::random_device rd;
  static std::mt19937 gen(rd());
  static std::uniform_real_distribution<double> dis(-1.0, 1.0);
  return dis(gen);
}
volatile double sink{}; // ensures a side effect
int main() {
  // Check the consistency with std::cos()
  for (const auto x : {0.125, 0.25, 0.5, 1. / (1 << 26)})
    std::print("x = {1}\n{2:.{0}}\n{3:.{0}}\nIs equal: {4}\n", 53, x, std::cos(x), custom::cos(x), std::cos(x) == custom::cos(x));
  auto benchmark = [](auto&& fun, auto rem) {
    auto const start{std::chrono::high_resolution_clock::now()};
    for (auto size{1UL}; size != 10'000'000UL; ++size) sink = fun(gen_random());
    std::chrono::duration<double> const diff{std::chrono::high_resolution_clock::now() - start};
    std::println("Time: {:f} sec {}", diff.count(), rem);
  };
  benchmark(custom::cos, "(custom::cos)");
  benchmark([](double x) { return std::cos(x); }, "(std::cos)");
}
```

## Structured Bindings

```cpp
import std;
std::tuple<std::string, int> CreatePerson() { return {"Cherno", 24}; }
int main() {
  auto [name, age] = CreatePerson(); // Structured binding (C++17)
  std::println("{}", name);

  // Or std::tie for already defined variables
  std::string name2;
  int age2;
  std::tie(name2, age2) = std::tuple("", 14);
}
```

## `std::async`

```cpp
import std;
std::mutex m;
int print(std::string_view const str) noexcept {
  std::lock_guard<std::mutex> lk(m); // lock_guard lock mutex to assure thread
  // safety (prevents multiple threads from touch resource at same time)
  std::println("{}", str);
  return 1919810;
}
int main() {
  auto a1{std::async(std::launch::deferred, print, "world!")}; // Calls
  // print("world!"), prints "world!" when a2.get() or a2.wait() is called
  auto a2{std::async(std::launch::async, print, "hello")}; // Calls print("hello")
  // with async policy
  std::this_thread::sleep_for(std::chrono::seconds(1));
  a1.wait(); // Now wait for a2 to complete
  std::println("{}", a1.get());
}
```

> In VS, you can use DEBUG&rarr;Windows&rarr;Parallel Stacks (`<C-S>-d`) to do window parallel debugs

## lvalues and rvalues in C++

Each **expression** belongs to exactly one of the three primary value categories: `prvalue`, `xvalue`, and `lvalue`.
- A `lvalue` ("generalized" lvalue) is an **expression** that its memory address can be taken of.
- A `prvalue` ("pure" rvalue) is an **expression** that we can't take of its memory address.
- A `xvalue` is ("expiring" value) is `prvalue` alike, but it's lifetime will not extend by a constant lvalue reference.
- A `rvalue` is either `prvalue` or `xvalue`.

> `template<class T> void f(T&&)`, here the `T&&` does not mean rvalue reference, but something called forwarding reference (also `void f(auto&&)`). Invoke these functions is like `f(auto(t))`.

```cpp
import std;
template <class T> struct is_prvalue : std::true_type {};
template <class T> struct is_prvalue<T&> : std::false_type {};
template <class T> struct is_prvalue<T&&> : std::false_type {};

template <class T> struct is_lvalue : std::false_type {};
template <class T> struct is_lvalue<T&> : std::true_type {};
template <class T> struct is_lvalue<T&&> : std::false_type {};

template <class T> struct is_xvalue : std::false_type {};
template <class T> struct is_xvalue<T&> : std::false_type {};
template <class T> struct is_xvalue<T&&> : std::true_type {};

void f() {}
struct S {
  int a;
  enum e { A, B, C };
  S() { std::println("Instantiated"); }
  S(int a) : a(a) {}
  void f() {}
  static void g() {}
};
int main() {
  int a{42};
  int const& b{a};
  int&& c{std::move(a)};
  S s;
  // '(T)' treat T as an expression, otherwise decltype() gets its type
  static_assert(is_lvalue<decltype((a))>::value && // variable names are lvalues
                is_lvalue<decltype((b))>::value && //
                is_lvalue<decltype((c))>::value);
  static_assert(is_lvalue<decltype((f))>::value); // a function is a lvalue

  static_assert(std::is_lvalue_reference_v<decltype(b)> && // Types and value
  // categories are not correspondent
                std::is_rvalue_reference_v<decltype(c)>);

  static_assert(is_prvalue<decltype((42))>::value && //
                is_prvalue<decltype((a + b))>::value && //
                is_prvalue<decltype((S{}))>::value && // Here no temporary objects
                // created
                is_prvalue<decltype((s.A))>::value); // Member enumerators are
                // rvalue

  static_assert(is_prvalue<decltype((f()))>::value && // function's return value may be
    // prvalue
                is_lvalue<decltype(([&a]() -> int& { return a; }()))>::value && // Or lvalue
    // if returns a lvalue reference
    // Or xvalue if returns a xvalue reference:
                is_xvalue<decltype(([&a]() -> int&& { return std::move(a); }()))>::value);

  std::println("{}", (S{} = S{42}).a); // rvalue can be in left, also
  // f = []() {}; // Ill-formed, lvalue don't mean it's assignable

  // Some xvalues
  static_assert(is_xvalue<decltype((S{}.a))>::value && // The member of object
  // expression is a xvalue. Here S{} is converted to xvalue, this process is
  // named temporary materialization conversion
                is_xvalue<decltype((std::move(a)))>::value); // std::move() cast
                // lvalue or prvalue to xvalue
  using A = int[3];
  static_assert(is_xvalue<decltype((A{1, 2, 3}[0]))>::value); // subscript of an
  // array prvalue is xvalue

  int const& d{std::move(0)}; // We shall not make references to xvalue
  std::println("{}", d); // Stack-use-after-scope occurs
}
```

### Lvalue reference and rvalue reference

```cpp
int main() {
  int a{10};
  int& b{a}; // lvalue reference can accept lvalue
  int const& c{10}; // constant lvalue reference can accept rvalue
  int&& d{10}; // rvalue reference can only accept rvalue
}
```

### Ref-qualifiers

```cpp
import std;
struct S {
  void f() & { std::println("called from lvalue object"); }
  void f() && { std::println("called from rvalue object"); }
  void f2(this S const& self, int i) { std::println("{}", i); } // Explicit
  // object function (C++23), same as
  // void f2(int i) const&;
};
int main() {
  S s;
  s.f(); // lvalue object
  S{}.f(); // rvalue object
  s.f2(42);
  std::invoke(&S::f2, s, 42);
}
```

## Move Semantics in C++

```cpp
import std;
class String {
private:
  std::size_t m_size;
  char* m_data;
public:
  String() = default; // Same as String(){}
  String(std::string_view const str) : m_size(str.size()), m_data(new char[str.size()]) {
    std::println("Created!");
    std::copy_n(str.cbegin(), m_size, m_data);
  }
  // Copy constructor
  String(String const& other) : m_size(other.m_size), m_data(new char[other.m_size]) {
    std::println("Copied!");
    std::copy_n(other.m_data, m_size, m_data);
  }
  String(String&& older) noexcept
      : m_size(older.m_size), m_data{older.m_data} { // Move constructor should
    // 'noexcept' qualified. Standard expects all non-trivial types has exception
    // guarantee. Which says when an exception is thrown, the involved objects are
    // still valid. So apparently this guarantee doesn't apply to move constructor.
    std::println("Moved!");
    // There presents a problem: when the old one gets deleted, it's going to
    // delete the m_data here as well. So the major thing that we need to do is to
    // make the old one point to nothing.
    older.m_size = 0, older.m_data = nullptr;
  }
  ~String() { std::println("Destroyed!"), delete[] m_data; }
  void print() {
    for (std::size_t i{}; i < m_size; i++) std::cout << m_data[i];
    std::println("");
  }
};
class Entity {
private:
  String m_name;
public:
  Entity(String const& name) : m_name(name) {}
  Entity(String&& name) noexcept : m_name(std::move(name)) {}
  void print_name() { m_name.print(); }
};
int main() {
  std::println("Use copy constructor");
  String str{"Proteus"};
  Entity e1{str};

  std::println("Use move constructor");
  Entity e2{String{"Cherno"}};

  e1.print_name(), e2.print_name();
}
```

### std::move and the Move Assignment Operator

`std::move` actually do force casting but can make your code more human friendly

Move assignment `T& operator=(T&& t)` allows us to do move operation on existing objects
```cpp
import std;
class String {
private:
  std::size_t m_size;
  char* m_data;
public:
  String() = default;
  String(std::string_view const str) : m_size(str.size()), m_data(new char[str.size()]) {
    std::println("Created!");
    std::copy_n(str.cbegin(), m_size, m_data);
  }
  // Copy constructor
  String(String const& other) : m_size(other.m_size), m_data(new char[other.m_size]) {
    std::println("Copied!");
    std::copy_n(other.m_data, m_size, m_data);
  }
  String(String&& older) noexcept : m_size(older.m_size), m_data{older.m_data} {
    std::println("Moved!");
    older.m_size = 0, older.m_data = nullptr;
  }
  String& operator=(String&& older) noexcept { // define move assignment
    if (this != &older) {
      delete[] m_data; // Move assignment assumes that there already exists data
      // in current class, we shall clean the m_data
      std::println("Moved!\n");
      m_size = older.m_size, m_data = older.m_data;
      older.m_size = 0, older.m_data = nullptr;
    }
    return *this;
  }
  ~String() { std::println("Destroyed!"), delete[] m_data; }
  void print() {
    for (std::size_t i{}; i < m_size; i++) std::cout << m_data[i];
    std::println("");
  }
};

int main() {
  String apple{"Apple"}, dest;

  std::print("Apple: "), apple.print();
  std::print("Dest: "), dest.print();

  dest = std::move(apple); // With 'std::move()' invokes move assignment

  std::print("Apple: "), apple.print();
  std::print("Dest: "), dest.print();
}
```

An example implementation of `std::move()`
```cpp
template <class T> struct remove_reference {
  using type = T;
};
template <class T> struct remove_reference<T&> {
  using type = T;
};
template <class T> struct remove_reference<T&&> {
  using type = T;
};
int main() {
  auto move{[]<class T>(T&& t) -> auto&& { return static_cast<remove_reference<T>::type&&>(t); }};
  int const& d{move(0)}; // We shall not make references to xvalue
  std::println("{}", d); // Stack-use-after-scope occurs
}
```

### Perfect forwarding (`std::forward`)

```cpp
import std;
template <typename T> consteval std::string_view type_name() noexcept {
  std::string_view capt{std::source_location::current().function_name()};
  return {capt.cbegin() + capt.find('=') + 2, capt.cend() - 1};
}

auto f(auto&&) { std::println("f(T&&) matched"); }
auto f(auto const&) { std::println("f(T const&) matched"); }

template <typename T> void wrapper(T&& arg) {
  f<T>(arg); // Forwarding reference will let it invokes f(T&&), so we need explicitly specify f<T>.
  f<T>(std::forward<T>(arg)); // Perfect forwarding
}
int main() {
  wrapper(1);
  int a{1};
  wrapper(a); // Compiler will deduce to 'int&', equivalent to wrapper(auto(a))
  wrapper(std::move(a));
  std::println(
    "{}, {}", type_name<decltype(std::move(a))>(), // std::decay gets the type as if passing to function arguments
    type_name<std::decay_t<decltype(std::move(a))>>()); // (array of 'T' gets 'T*'; function types gets function pointer type; remove cv-qualifier).
}
```

## std::format & std::print

```cpp
import std;
int main() {
  char a{'a'};
  // Fill with asterisk: Align '<' left, '>' right, '^' center.
  std::println("{0:*<8},{0:*>8},{0:*^8}", a);
  // Sign: '+' show plus explicitly, ' ' (space) add leading space, '-' default.
  std::println("{0:},{0:+},{0: }\n{1:},{1:+},{1: }", 1, -1);
  // '#' alternate the integer form. '#x' hex, '#b' bin, '#d' dec, '#0x' padding
  std::println("{0:#010x}", 1); // leading zeros (only field witdh)

  // The precision '.': for float is precision, for string is the upper bound to
  // be output.
  std::println( "{0:#015.2f},{0:#015.2e}", 114514.1919810); // minimal width 15,
  // precision 2, padding with zeros, 'f' std::fixed format, 'e' scientific format
  std::println("{0:.<15.2s}", "114514.1919810"); // minimal width 15, precision 2,
  // align left, padding with dots
  std::println("{:.<5.5s}", "🐱🐱🐱"); // "🐱🐱.", because emoji has two char wide
  // Type TODO
}
```

## Compiler Optimization

- `[[likely]]`/`[[unlikely]]` used in if-statements and loops with logical decision.
- `volatile` tells compiler don't optimize.
- `constexpr` declares that it is possible to evaluate the value of the function or variable at compile-time. Such variables and functions can only utilize resources at compile-time.
  `constexpr char const*` is equivalent to `char const*const`, but you cannot write `char const*constexpr` at current.
- `consteval` force evaluate expression in compile-time.
- `noexcpt` for function that never `throw` error. Destructors are implicitly `noexcept`.

  Due to strong exception guarantee, `std::vector` moves its elements on rearrange only if their move constructors are `noexcept`. You can use `static_assert(std::is_nothrow_move_constructible_v<Object>);` to check.
- `constinit` enforces variable is initialized at compile-time. Unlike `constexpr`, it allows non-trivial destructors. Therefore, it can avoid the problem that the order of initialization of static variables from different translation units is undefined, by initialize them at compile-time.
   Another use-case is with non-initializing `thread_local` declarations. In such a case, it tells the compiler that the variable is already initialized, otherwise the compiler usually adds code to check and initialize it whether required on each usage.

```cpp
struct S {
  constexpr S() {}
  ~S() {} // Without constexpr makes it non-trivial
};

// constexpr S s1{}; // Error because destructor is non-trivial
constinit S s1{}; // OK

// tls_definitions.cpp
thread_local constinit int tls1{1};
thread_local int tls2{2};

// main.cpp
extern thread_local constinit int tls1;
extern thread_local int tls2;

int get_tls1() { return tls1; } // pure TLS access
int get_tls2() { return tls2; } // has implicit TLS initialization code
```

## Three-way comparison

Comparison categories (Return types of the `operator<=>()`)
- `strong_ordering`: exactly one if `a < b`, `a == b`, `a > b` must be true and if `a == b` then `f(a) == f(b)`.
- `weak_ordering`: exactly one if `a < b`, `a == b`, `a > b` must be true and if `a == b` then `f(a)` not necessary equal to `f(b)`.
- `partial_ordering`: none of `a < b`, `a == b`, `a > b` might be true (maybe incomparable) and if `a == b` then `f(a)` not necessarily equal to `f(b)`. e.g. In `float`/`double` the `NaN` is not comparable

```cpp
import std;
template <typename T1, typename T2> requires requires(T1 a, T2 b) { a < b, a <= b, a > b, a >= b, a == b, a != b; }
consteval void f() {}

struct S2 {
  int a, b;
};
// Compiler can replace calls with <, <=, >, >= to operator<=>(), and calls to ==, != with
// operator==(). For example:
// a < b to a <=>b < 0
// a!= b to !(a <=> b == 0)
struct S1 {
  int a, b;
  constexpr auto operator<=>(S1 const&) const = default; // Homogeneous comparisons
  constexpr bool operator==(S1 const&) const = default; // Note: Defaulted
  // operator<=>() also declares defaulted operator==(), but here the
  // operator==(S2 const&) prevents the implicitly default one.
  // Heterogeneous comparisons:
  constexpr std::strong_ordering operator<=>(S2 const& other) const {
    if (auto cmp = a <=> other.a; cmp != 0) return cmp;
    return b <=> other.b;
  }
  constexpr auto operator==(S2 const& other) const { return (*this <=> other) == 0; }
};
int main() {
  f<S1, S1>();
  f<S1, S2>();
}
```

## Modules

Module units whose declaration has `export` are termed *module interface units*; all other module units are termed `module implementation units`.

```cpp
// hello.cppm
export module hello.cpp; // dots are four readability purpose
export imort :helpers; // re-export heplers partition (see below)
import :impl;
export void f() { utility(); }
```
```cpp
// hello.impl.cppm
module; // Global module fragment (allows include classical header files)
#include <vector>
module hello.cpp:impl; // Module implementation partition unit
void utility() {};
```
```cpp
//hello.helpers.cppm
export module hello:helpers; // Module interface partition unit
import :internals;
export void g() { utility(); }
```
```cpp
// main.cpp
import hello.cpp;
main () {
  f(), g();
}
```

## Standard library

Diagnostics Tools:
```cpp
std::is_move_constructible_v<T, ...Args>
std::is_trivially_constructible_v<T,...Args>
```

```cpp
import std;
int main(int argc, char const* argv[]) {
  if (argc < 2) {
    std::println("Please add some parameters");
    return -1;
  }
  // std::stof, std::stod
  // Converts literal string to floating point
  double arg1{std::stod(argv[1])};
  std::println("Arg1: {}", arg1);

  // std::locale
  std::locale::global(std::locale{"en_US.UTF-8"});
  std::println("Current currency: {} {}",
               std::use_facet<std::moneypunct<char, true>>(std::locale{}).curr_symbol(), std::locale{}.name());
  // std::invoke
  auto add{[](int a, int b) constexpr { return a + b; }};
  std::println("Invokes add(1, 2): {}", std::invoke(add, 1, 2));
}
```

## Constrained algorithms

TODO: [std::ranges](https://en.cppreference.com/w/cpp/algorithm/ranges#Constrained_fold_operations)

### References

1. [C++ by The Cherno](https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb)
2. [All C++20 core language features with examples](https://oleksandrkvl.github.io/2021/04/02/cpp-20-overview.html#attr-likely)
3. [c++20 の coroutine 使ってみる](https://qiita.com/ousttrue/items/0572c7cec966bb33067f)
4. [Force reinterpret_cast to return nullptr](https://stackoverflow.com/a/66278895/26004653)
5. [Curiously Recurring Template Pattern](https://en.cppreference.com/w/cpp/language/crtp)
6. [Value category p95.&sect;7.2.1 \[basic.lval\]](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2023/n4950.pdf)
7. [Temporary materialization conversion p99.&sect;7.3.5 \[conv.rval\]](Working Draft, Standard for Programming Language C++, N4950)
8. [CMake: Public VS Private VS Interface](https://leimao.github.io/blog/CMake-Public-Private-Interface/)

## Continuous Integration in C++

## Static Analysis in C++

Static Analysis is a very important thing even for an experienced programmer. It can find logic errors in code and gives some tips to fix it.

`clang-tidy` is a free tool to do static analysis.

## Argument Evaluation Order in C++

## ARRAY - Making DATA STRUCTURES in C++

## How to Deal with OPTIONAL Data in C++

## Multiple TYPES of Data in a SINGLE VARIABLE in C++?

## How to store ANY data in C++

## How to make your STRINGS FASTER in C++!

## VISUAL BENCHMARKING in C++ (how to measure performance visually)

## SINGLETONS in C++

## Small String Optimization in C++

## Track MEMORY ALLOCATIONS the Easy Way in C++

## std::range

## Precompiled Headers in C++

Look to 7:07

