# VibeScript Language Design Plan

## Vision

VibeScript is a programming language designed **for AI agents, not humans**. It prioritizes:
- **Machine parseability** over human readability
- **Performance** — compiles to native code via Go
- **Compactness** — minimal token usage for AI context windows
- **Unambiguity** — every construct has exactly one meaning
- **Evolvability** — the language can be extended by AI agents without breaking existing programs

## Architecture: Compiled Language (Go-based)

```
.vs source → Lexer → Parser → AST → Compiler → Go codegen → Native binary
```

VibeScript compiles to Go source code, then leverages `go build` for native binaries.
This gives us Go's full portability (Linux, macOS, Windows, ARM, WASM) for free.

---

## Phase 1: Core Language Infrastructure

### 1.1 Project Structure
```
vibescript/
├── cmd/
│   └── vsc/              # CLI compiler/runner
│       └── main.go
├── pkg/
│   ├── lexer/            # Tokenizer
│   │   ├── lexer.go
│   │   └── lexer_test.go
│   ├── token/            # Token types
│   │   └── token.go
│   ├── parser/           # Parser → AST
│   │   ├── parser.go
│   │   └── parser_test.go
│   ├── ast/              # AST node definitions
│   │   └── ast.go
│   ├── compiler/         # AST → Go source
│   │   ├── compiler.go
│   │   └── compiler_test.go
│   └── runtime/          # Minimal runtime support lib
│       └── runtime.go
├── examples/             # Example .vs programs
├── spec/                 # Language specification (machine-readable)
│   └── grammar.ebnf
├── go.mod
└── go.sum
```

### 1.2 Token Design (Compact, Unambiguous)

VibeScript uses **short symbolic tokens** — no English keywords. AI agents work
equally well with symbols as with words, and symbols are more compact.

| Concept          | VibeScript | Go Equivalent      |
|------------------|------------|---------------------|
| Function def     | `@`        | `func`              |
| Return           | `^`        | `return`            |
| Variable binding | `:`        | `:=` / `var`        |
| If               | `?`        | `if`                |
| Else             | `\|`       | `else`              |
| Loop (for)       | `~`        | `for`               |
| Print/Output     | `>`        | `fmt.Println`       |
| Input            | `<`        | `fmt.Scanln`        |
| Struct def       | `#`        | `type X struct`     |
| Method           | `#.`       | method on struct    |
| Import           | `+`        | `import`            |
| And              | `&&`       | `&&`                |
| Or               | `\|\|`     | `\|\|`              |
| Not              | `!`        | `!`                 |
| Equal            | `==`       | `==`                |
| Not equal        | `!=`       | `!=`                |
| Block open       | `{`        | `{`                 |
| Block close      | `}`        | `}`                 |
| Array literal    | `[`...`]`  | `[]T{...}`          |
| Map literal      | `{k:v}`    | `map[K]V{k:v}`      |
| Type annotation  | `::`       | type declaration    |
| Lambda           | `\`        | anonymous func      |
| Pipe             | `\|>`      | chained call        |
| Spread           | `...`      | variadic            |
| Nil/null         | `_`        | `nil`               |
| True/False       | `1b`/`0b`  | `true`/`false`      |
| Comment          | `--`       | `//`                |
| String           | `"..."`    | `"..."`             |
| Int              | `42`       | `42`                |
| Float            | `3.14`     | `3.14`              |
| Semicolon (stmt) | `;`        | `;` (auto-inserted) |

### 1.3 Type System

Static types, inferred where possible. Types:
- `i` — int64
- `f` — float64
- `s` — string
- `b` — bool
- `[T]` — slice of T
- `{K:V}` — map
- `?T` — optional (nullable)
- `@(T,T)->T` — function type
- `#Name` — struct type
- `()` — void/unit

### 1.4 Syntax Examples

**Hello World:**
```
>"hello world";
```

**Variables:**
```
x:42;
name:"vibescript";
pi:3.14;
```

**Functions:**
```
@add(a::i,b::i)::i{^a+b};
@main(){>"result: ",add(2,3)};
```

**Control flow:**
```
?(x>10){>"big"}|{>"small"};

~(i:0;i<10;i+1){>i};

~(item:[1,2,3]){>item};
```

**Structs:**
```
#Point{x::f,y::f};
#.Point.dist(o::#Point)::f{^((x-o.x)**2+(y-o.y)**2)**0.5};

p:Point{x:1.0,y:2.0};
```

**Lambdas and pipes:**
```
nums:[1,2,3,4,5];
result:nums|>filter(\n{^n>2})|>map(\n{^n*2});
```

---

## Phase 2: Implementation Order

### Step 1 — Token & Lexer
- Define all token types in `token/token.go`
- Implement lexer that converts `.vs` source into token stream
- Full test coverage

### Step 2 — AST Definitions
- Define all AST node types (expressions, statements, program)
- Visitor pattern for tree walking

### Step 3 — Parser
- Recursive descent parser (Pratt parsing for expressions)
- Operator precedence table
- Produces typed AST from token stream
- Full test coverage

### Step 4 — Go Code Generator
- Walk AST, emit valid Go source code
- Handle type mapping (i→int64, f→float64, etc.)
- Generate `main` package with imports
- Pipe operator desugaring
- Lambda lifting

### Step 5 — CLI Tool (`vsc`)
- `vsc run file.vs` — compile and run
- `vsc build file.vs` — compile to binary
- `vsc emit file.vs` — show generated Go code (for debugging)
- `vsc fmt file.vs` — canonical formatting

### Step 6 — Standard Library Builtins
- I/O: `>` (print), `<` (read)
- Collections: `len`, `filter`, `map`, `reduce`, `sort`
- Math: basic math ops
- String: `split`, `join`, `trim`, `contains`
- Concurrency: `go{}` blocks (maps to goroutines)

---

## Phase 3: Advanced Features (Future)

- **Channel/concurrency primitives** — map to Go channels
- **Error handling** — `!` operator for error propagation (like Rust's `?`)
- **Generics** — minimal generic support via Go generics
- **Module system** — `+mod/pkg` imports
- **Self-describing spec** — machine-readable grammar that AI agents can query
- **WASM compilation target** — via Go's WASM support
- **LSP server** — for AI agent integration
- **Self-evolution protocol** — AI agents can propose grammar extensions via spec PRs

---

## Design Principles

1. **Token economy** — Every construct should use minimum tokens. AI agents pay per token.
2. **No syntactic sugar** — One way to do each thing. No ambiguity.
3. **Flat learning curve for AI** — The grammar fits in a single context window.
4. **Performance by default** — Compiles to native Go. No interpreter overhead.
5. **Deterministic parsing** — LL(1) where possible. No backtracking needed.
6. **Evolvable** — The EBNF grammar is the source of truth. Extend it, regenerate the parser.

---

## Immediate Next Steps

Implement Phase 2, Steps 1-5 to get a working compiler that can:
1. Lex a `.vs` file into tokens
2. Parse tokens into an AST
3. Generate Go source from the AST
4. Compile and run the resulting Go program

Target milestone: **`>"hello world";` compiles and runs.**
