# CMake Notes

Set include directories
```cmake
# The header file will be written into the build dir
target_include_directories(Tutorial PUBLIC "${PROJECT_BINARY_DIR}")
```

## Configure Clangd

```yaml
CompileFlags:
  CompilationDatabase: ../build/
```
```bash
cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=YES ...
```

## Public VS Private VS Interface

| Link Type | Description |
| --------- | ----------- |
| `PUBLIC`  | Everyone who depends on me is going to get this property. |
| `PRIVATE` | This property is just for me. Whoever depends on me is not going to get this. |
| `INTERFACE` | I do not need this for myself. But anyone who depends on me will get this property. | 

Some target properties
- `SOURCES`, `INTERFACE_SOURCES`;
- `LINK_LIBRARIES`, `INTERFACE_LINK_LIBRARIES`;
- `COMPILE_DEFINITIONS`, `INTERFACE_COMPILE_DEFINITIONS`.

To diagnostics:
```cmake
get_target_property(ARG1 Tutorial SOURCES)
get_target_property(ARG2 Tutorial INTERFACE_SOURCES)

get_target_property(ARG3 Tutorial INCLUDE_DIRECTORIES)
get_target_property(ARG4 Tutorial INTERFACE_INCLUDE_DIRECTORIES)

get_target_property(ARG5 Tutorial LINK_LIBRARIES)
get_target_property(ARG6 Tutorial INTERFACE_LINK_LIBRARIES)

get_target_property(ARG7 Tutorial COMPILE_DEFINITIONS)
get_target_property(ARG8 Tutorial INTERFACE_COMPILE_DEFINITIONS)
message(${ARG1}, ${ARG2},\n
  ${ARG3}, ${ARG4},\n
  ${ARG5}, ${ARG6},\n
  ${ARG7}, ${ARG8})
```

## Pass CMake Properties into Header Files

```cmake
// CMakeLists.txt
project(Tutorial VERSION 1.0)
configure_file(TutorialConfig.h.in TutorialConfig.h)
```
```cpp
#define Tutorial_VERSION_MAJOR @Tutorial_VERSION_MAJOR@
#define Tutorial_VERSION_MINOR @Tutorial_VERSION_MINOR@
```

## Add a Library / Module (And Add an OPTION to Switch)

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.30 FATAL_ERROR)

set(CMAKE_EXPERIMENTAL_CXX_IMPORT_STD "0e5b6991-d74f-4b3d-a41c-cf096e0b2508")
set(CMAKE_CXX_FLAGS "-stdlib=libc++")

project(Hello CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED True)
set(CMAKE_EXPORT_COMPILE_COMMANDS True)
set(CMAKE_CXX_MODULE_STD True)

add_executable(Hello main.cpp)

option(USE_MODULE "Whether use the form of C++20's module" YES)

add_subdirectory(mylib)
if(NOT USE_MODULE)
  target_include_directories(Hello PRIVATE "${PROJECT_SOURCE_DIR}/mylib")
else()
  target_compile_definitions(Hello PRIVATE USE_MODULE)
endif()
target_link_libraries(Hello PRIVATE Mylib)
```
```cmake
# mylib/CMakeLists.txt
add_library(Mylib SHARED)
if(USE_MODULE)
  target_compile_definitions(Mylib PRIVATE USE_MODULE)
  target_sources(Mylib PUBLIC FILE_SET CXX_MODULES FILES mylib.cpp)
else()
  target_sources(Mylib PRIVATE mylib.cpp)
endif()
```
```cpp
// mylib/mylib.h
#pragma once
namespace mylib { void print(); }
```
```cpp
// mylib/mylib.cpp
#ifdef USE_MODULE
export module mylib;
import std;
export
#else
#include "mylib.h"
#include <print>
#endif
    namespace mylib {
void print() {
#ifdef USE_MODULE
  std::println(" with C++ modules!");
#else
  std::println(" without C++ modules!");
#endif
}
} // namespace mylib
```
```cpp
// main.cpp
#ifdef USE_MODULE
import mylib;
import std;
#else
#include "mylib.h"
#include <print>
#endif
int main() { std::print("Hello"), mylib::print(); }
```
```json
// CMakePresets.json
{
  "version": 9,
  "configurePresets": [
    {
      "name": "default",
      "binaryDir": "${sourceDir}/build",
      "displayName": "Default Config",
      "description": "Default build using Ninja generator",
      "generator": "Ninja",
      "cacheVariables": {
        "CMAKE_CXX_COMPILER": "/usr/bin/clang++",
        "CMAKE_EXE_LINKER_FLAGS": "-fuse-ld=lld",
        "CMAKE_AR": "/usr/bin/llvm-ar",
        "CMAKE_RANLIB": "/usr/bin/llvm-ranlib"
      }
    }
  ]
}
```
To validate:
```bash
$ cmake --preset=default -DUSE_MODULE=NO -B ./build && cmake --build ./build && ./build/Hello
```

## Reference

- [CMake: Public VS Private VS Interface](https://leimao.github.io/blog/CMake-Public-Private-Interface/)
- [Examples of when PUBLIC/PRIVATE/INTERFACE should be used in cmake](https://stackoverflow.com/a/78546252/26004653)
- [CMake Tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/index.html)
- [Math functions for graphics and geometric calculations](https://github.com/mls-m5/matmath/tree/master)
