window.COURSE_MODULES = [
  {
    id: "foundations",
    phase: "Foundations",
    title: "Expressions, Types, and Evaluation",
    lectures: "Lecture 1",
    source: "Lecture 1; Induction HW, Types and Evaluation",
    summary: "Read SML expressions as typed computations and separate an expression, its type, and its eventual value.",
    stages: [
      {
        title: "Expressions become values",
        slides: [
          {
            label: "Evaluation",
            title: "A computation is a reduction trace",
            body: "An expression is program text. Evaluation repeatedly applies language rules until a value is reached. Some well-typed expressions have no value because they loop or raise an exception.",
            bullets: [
              "Value: a final result that cannot take another evaluation step.",
              "Valuable: evaluation terminates at a value.",
              "Type checking happens before evaluation."
            ],
            code: "(2 + 3) * 4\n=> 5 * 4\n=> 20"
          },
          {
            label: "Typing",
            title: "Types predict permitted behavior",
            body: "A typing trace works from subexpressions outward. Every operator imposes requirements on its operands, and the whole expression receives the operator's result type.",
            bullets: [
              "Both branches of an if expression must have the same type.",
              "Tuple components may have different types.",
              "An ill-typed expression never gets an evaluation trace."
            ],
            code: "\"15\" ^ \"150\" : string\n(3, true) : int * bool\n\"1\" ^ 50 : NWT"
          }
        ],
        check: {
          prompt: "Which statement correctly separates typing from evaluation?",
          options: [
            "A well-typed expression must always terminate.",
            "An ill-typed expression can be evaluated if its bad branch is skipped.",
            "A well-typed expression may still loop or raise an exception.",
            "The value of an expression determines whether it type-checks."
          ],
          answer: 2,
          explanation: "Type safety does not imply termination. A well-typed computation can loop forever or raise a declared exception."
        }
      },
      {
        title: "Declarations and function application",
        slides: [
          {
            label: "Functions",
            title: "A function type records input and output",
            body: "If a function consumes a value of type t1 and produces a value of type t2, its type is t1 -> t2. Applying it requires the argument type to match its input type.",
            bullets: [
              "Functions are values.",
              "Function application is written by juxtaposition.",
              "The function expression is evaluated before its argument."
            ],
            code: "fun double (n : int) : int = n + n\n\ndouble : int -> int\ndouble 3 => 6"
          },
          {
            label: "Bindings",
            title: "A declaration extends the environment",
            body: "A val or fun declaration binds a name to a value. Later expressions look up that name in the current environment; the declaration itself is not assignment.",
            bullets: [
              "A binding gives a name a meaning in a scope.",
              "Shadowing creates a newer binding for the same name.",
              "Earlier closures retain the environment where they were created."
            ],
            code: "val x = 2\nval y = x + 1\nval x = 10\n\n(* y is still 3 *)"
          }
        ],
        check: {
          prompt: "After val x = 2; val y = x + 1; val x = 10, what is y?",
          options: ["3", "11", "12", "NWT"],
          answer: 0,
          explanation: "The declaration of y uses the binding of x that exists at that point. Later shadowing does not mutate y."
        }
      }
    ],
    practice: [
      {
        id: "foundations-trace",
        title: "Type and evaluation trace",
        difficulty: "Core",
        prompt: "Give the type and complete evaluation trace of the expression below. If it has no value, identify exactly where evaluation stops.",
        starter: "let\n  val p = (3 + 2, \"cmu\")\nin\n  (#1 p * 2, #2 p ^ \"150\")\nend",
        rubric: [
          "States the most specific type of the entire expression.",
          "Shows binding of p before evaluating the body.",
          "Reduces both tuple components in the correct order.",
          "Keeps type reasoning separate from value reasoning."
        ]
      },
      {
        id: "foundations-function",
        title: "Build a typed helper",
        difficulty: "Core",
        prompt: "Write an SML function repeatPair that takes an int and returns a pair containing that int and twice that int. Include its most general type and one test.",
        starter: "fun repeatPair n =\n  (* your code *)",
        rubric: [
          "The function returns a two-component tuple.",
          "Arithmetic correctly constrains the argument to int.",
          "The stated type agrees with the implementation.",
          "The test checks a concrete expected value."
        ]
      }
    ]
  },
  {
    id: "functions-scope",
    phase: "Foundations",
    title: "Functions, Scope, and Equivalence",
    lectures: "Lecture 2",
    source: "Lecture 2; Induction HW typify exercises",
    summary: "Use lambdas, patterns, lexical scope, and extensional equivalence to reason about function values.",
    stages: [
      {
        title: "Patterns drive control flow",
        slides: [
          {
            label: "Patterns",
            title: "Match the shape and bind its pieces",
            body: "A pattern simultaneously checks the constructor of a value and introduces names for its components. Function clauses and case expressions are two surfaces for the same idea.",
            bullets: [
              "Tuple patterns unpack tuples.",
              "[] and x :: xs distinguish the two list constructors.",
              "Every clause of one function must return the same type."
            ],
            code: "fun first (x, _) = x\n\nfun isEmpty [] = true\n  | isEmpty (_ :: _) = false"
          },
          {
            label: "Conditionals",
            title: "Every branch must agree",
            body: "SML type-checks every branch, including branches that will not execute for a particular input. The condition must be bool, and both result branches must share one type.",
            bullets: [
              "if e1 then e2 else e3 requires e1 : bool.",
              "e2 and e3 must have the same type.",
              "Pattern coverage is a separate question from typing."
            ],
            code: "if n = 0 then \"zero\" else Int.toString n\n\n(* int in one branch and string in the other is NWT *)"
          }
        ],
        check: {
          prompt: "Why is fn [] => true | x :: xs => x not well-typed?",
          options: [
            "The patterns overlap.",
            "The empty branch returns bool while the cons branch returns an element.",
            "A lambda cannot use multiple clauses.",
            "Lists cannot be polymorphic."
          ],
          answer: 1,
          explanation: "Both clauses must share one result type. The first forces bool, while the second forces the list element type."
        }
      },
      {
        title: "Closures and equivalence",
        slides: [
          {
            label: "Scope",
            title: "Functions close over lexical bindings",
            body: "A function value remembers the environment at its definition site. Calling the function later uses those captured bindings, even if a name has since been shadowed.",
            bullets: [
              "Scope is determined by program text.",
              "A closure is code plus its defining environment.",
              "Shadowing does not retroactively alter a closure."
            ],
            code: "val x = 2\nval f = fn y => x + y\nval x = 100\n\nf 3 => 5"
          },
          {
            label: "Equivalence",
            title: "Functions are compared extensionally",
            body: "Two functions are extensionally equivalent when they produce equivalent behavior for every valid input. You cannot establish function equivalence by comparing printed closures.",
            bullets: [
              "Values of ordinary data are compared by their observable result.",
              "For functions, quantify over arbitrary input values.",
              "Totality matters because a function may fail to produce an output."
            ],
            code: "fn x => x + x\n~\nfn x => 2 * x"
          }
        ],
        check: {
          prompt: "What is the most general type of fn f => (fn x => f x)?",
          options: [
            "('a -> 'b) -> 'a -> 'b",
            "'a -> 'a",
            "('a * 'b) -> 'b",
            "int -> int"
          ],
          answer: 0,
          explanation: "x has some type 'a, f must accept 'a and return some 'b, and the outer lambda accepts that function."
        }
      }
    ],
    practice: [
      {
        id: "scope-closure",
        title: "Trace a closure",
        difficulty: "Core",
        prompt: "State the type and value of result. Explain which binding of offset is used and why.",
        starter: "val offset = 4\nval addOffset = fn x => x + offset\nval offset = 100\nval result = addOffset 3",
        rubric: [
          "States result : int.",
          "Computes the correct result.",
          "Identifies the binding captured at function creation.",
          "Uses lexical scope rather than assignment language."
        ]
      },
      {
        id: "scope-pattern",
        title: "Repair the clauses",
        difficulty: "Stretch",
        prompt: "Rewrite this intended function so it is total and well-typed: it should return NONE on an empty list and SOME of the first element otherwise. State its MGT.",
        starter: "fun head [] = NONE\n  | head (x :: xs) = x",
        rubric: [
          "Both clauses return the same option type.",
          "The cons case wraps the element with SOME.",
          "The function covers both list constructors.",
          "The MGT preserves an unconstrained element type."
        ]
      }
    ]
  },
  {
    id: "recursion-lists",
    phase: "Core",
    title: "Recursion, Lists, and Tail Calls",
    lectures: "Lectures 3-4",
    source: "Lectures 3-4; Induction HW list recursion and stepping",
    summary: "Match recursive code to the recursive structure of naturals and lists, then recognize when an accumulator makes a call tail-recursive.",
    stages: [
      {
        title: "The recursive formula",
        slides: [
          {
            label: "Recursion",
            title: "Base, assume, combine",
            body: "A recursive function follows four moves: identify a base case, make progress to a smaller input, assume the recursive call solves that smaller input, and combine its result into the current answer.",
            bullets: [
              "The recursive call must move toward a base case.",
              "Its contract describes what result you may assume.",
              "Case expressions are useful when recursion follows data constructors."
            ],
            code: "fun length [] = 0\n  | length (_ :: xs) = 1 + length xs"
          },
          {
            label: "Lists",
            title: "Lists have exactly two constructors",
            body: "Every 'a list is either [] or x :: xs. Code that handles both constructors directly avoids unsafe head/tail preconditions and mirrors structural reasoning.",
            bullets: [
              "[] is the empty-list constructor.",
              ":: has type 'a * 'a list -> 'a list.",
              "The tail xs is structurally smaller than x :: xs."
            ],
            code: "case xs of\n    [] => base\n  | x :: rest => step (x, rest)"
          }
        ],
        check: {
          prompt: "Which recursive call is structurally smaller for an input x :: xs?",
          options: ["f (x :: xs)", "f [x]", "f xs", "f (xs @ [x])"],
          answer: 2,
          explanation: "xs is the immediate substructure of x :: xs and is therefore the standard structurally smaller recursive input."
        }
      },
      {
        title: "Tail recursion and list cost",
        slides: [
          {
            label: "Tail calls",
            title: "Nothing remains after a tail call",
            body: "A recursive call is in tail position when its result is returned immediately. An accumulator carries the partially completed answer so no deferred operation waits on the call stack.",
            bullets: [
              "1 + length xs is not a tail call.",
              "loop (xs, acc + 1) is a tail call.",
              "The helper invariant explains what the accumulator means."
            ],
            code: "fun length xs =\n  let\n    fun loop ([], acc) = acc\n      | loop (_ :: rest, acc) = loop (rest, acc + 1)\n  in\n    loop (xs, 0)\n  end"
          },
          {
            label: "List operators",
            title: "Cons is cheap; append walks left",
            body: "x :: xs is constant work. xs @ ys must walk and rebuild the left list xs. Repeated append inside recursion can turn an otherwise linear traversal into quadratic work.",
            bullets: [
              "Prefer building with :: and reverse once when order permits.",
              "rev written with append is not tail-recursive.",
              "Choose an accumulator representation that makes each step cheap."
            ],
            code: "[] @ ys = ys\n(x :: xs) @ ys = x :: (xs @ ys)"
          }
        ],
        check: {
          prompt: "Why is fun rev [] = [] | rev (x :: xs) = rev xs @ [x] costly?",
          options: [
            "The function is polymorphic.",
            "Every append walks the increasingly large reversed prefix.",
            "Pattern matching copies the input.",
            "Singleton lists are not values."
          ],
          answer: 1,
          explanation: "Append is linear in its left argument, and those left arguments grow across the recursion, producing quadratic total work."
        }
      }
    ],
    practice: [
      {
        id: "lists-alternate",
        title: "Alternating split",
        difficulty: "Core",
        prompt: "Write splitAlternating : 'a list -> 'a list * 'a list. Elements at even positions go to the first output and odd positions to the second. Preserve order and use structural recursion.",
        starter: "fun splitAlternating xs =\n  (* your code *)",
        rubric: [
          "Handles empty, singleton, and two-or-more element shapes.",
          "Each recursive call uses a structurally smaller list.",
          "Both output lists preserve the original relative order.",
          "The implementation remains polymorphic."
        ]
      },
      {
        id: "lists-tail",
        title: "Tail-recursive reverse",
        difficulty: "Core",
        prompt: "Implement reverse with a local tail-recursive helper. State the accumulator invariant in one sentence.",
        starter: "fun reverse xs =\n  let\n    fun loop (rest, acc) =\n      (* your code *)\n  in\n    loop (xs, [])\n  end",
        rubric: [
          "The helper handles both list constructors.",
          "The recursive call is in tail position.",
          "Each step uses cons rather than append.",
          "The invariant correctly relates rest, acc, and the final result."
        ]
      }
    ]
  },
  {
    id: "datatypes-trees",
    phase: "Core",
    title: "Datatypes and Trees",
    lectures: "Lecture 5",
    source: "Lecture 5; Datatypes HW",
    summary: "Treat constructors as typed functions and write tree programs by matching each constructor exactly once.",
    stages: [
      {
        title: "Constructors create and reveal data",
        slides: [
          {
            label: "Datatypes",
            title: "Each constructor has its own type",
            body: "A datatype declaration introduces a new type and constructor functions. A nullary constructor is already a value; a constructor with payload consumes the payload type.",
            bullets: [
              "Constructors begin with capital letters by convention.",
              "Constructors from different datatypes never unify.",
              "A case expression may bind constructor payloads."
            ],
            code: "datatype job = Student\n             | TA of string\n             | Professor of string\n\nTA : string -> job"
          },
          {
            label: "Options",
            title: "Represent absence in the type",
            body: "The option datatype makes possible failure explicit: NONE carries no result and SOME x carries a successful value. Consumers must handle both shapes.",
            bullets: [
              "NONE : 'a option.",
              "SOME : 'a -> 'a option.",
              "Returning option often avoids unsafe preconditions."
            ],
            code: "fun safeHead [] = NONE\n  | safeHead (x :: _) = SOME x"
          }
        ],
        check: {
          prompt: "Given datatype job = Student | TA of string, what is the type of TA?",
          options: ["job", "string", "string -> job", "job -> string"],
          answer: 2,
          explanation: "TA is a constructor function that consumes its string payload and produces a job value."
        }
      },
      {
        title: "Recursive trees and traversals",
        slides: [
          {
            label: "Trees",
            title: "A tree contains smaller trees",
            body: "Recursive datatypes describe values in terms of smaller values of the same datatype. Tree functions therefore recur independently on the left and right subtrees.",
            bullets: [
              "Empty is the base constructor.",
              "Node carries two recursive subtrees plus data.",
              "The function result type must agree across constructors."
            ],
            code: "datatype 'a tree = Empty\n                 | Node of 'a tree * 'a * 'a tree"
          },
          {
            label: "Traversal",
            title: "Traversal order comes from combination order",
            body: "Preorder, inorder, and postorder all make the same recursive calls. They differ in where the current node's value is placed relative to the two recursive results.",
            bullets: [
              "Preorder: root, left, right.",
              "Inorder: left, root, right.",
              "Postorder: left, right, root."
            ],
            code: "fun inorder Empty = []\n  | inorder (Node (l, x, r)) =\n      inorder l @ (x :: inorder r)"
          }
        ],
        check: {
          prompt: "Which ordering describes inorder traversal?",
          options: ["root, left, right", "left, root, right", "left, right, root", "right, root, left"],
          answer: 1,
          explanation: "Inorder recursively visits the left subtree, then the root value, then the right subtree."
        }
      }
    ],
    practice: [
      {
        id: "trees-map",
        title: "Polymorphic tree map",
        difficulty: "Core",
        prompt: "Using the given datatype, write treeMap : ('a -> 'b) -> 'a tree -> 'b tree.",
        starter: "datatype 'a tree = Empty | Node of 'a tree * 'a * 'a tree\n\nfun treeMap f t =\n  (* your code *)",
        rubric: [
          "Covers Empty and Node.",
          "Applies f exactly to stored values.",
          "Recursively maps both subtrees.",
          "Produces the stated polymorphic output type."
        ]
      },
      {
        id: "trees-traversal",
        title: "Traversal without quadratic append",
        difficulty: "Stretch",
        prompt: "Write an inorder traversal helper that takes an accumulator and avoids using @. Explain what list the helper returns.",
        starter: "fun inorderAcc (t, acc) =\n  (* your code *)",
        rubric: [
          "The helper handles both tree constructors.",
          "No append operator is used.",
          "Recursive calls place elements in inorder.",
          "The accumulator meaning is stated precisely."
        ]
      }
    ]
  },
  {
    id: "work-span",
    phase: "Core",
    title: "Work, Span, and Sorting",
    lectures: "Lectures 6-7",
    source: "Lectures 6-7; Work-Span Lab",
    summary: "Translate recursive structure into work and span recurrences, then recognize how balance and expensive helpers affect asymptotic cost.",
    stages: [
      {
        title: "Work and recurrence setup",
        slides: [
          {
            label: "Work",
            title: "Count total operations",
            body: "Work W(n) is the total computational effort. Derive it from the function body: count nonrecursive work and add the work of every recursive call.",
            bullets: [
              "One size n-1 call often gives W(n) = W(n-1) + O(1).",
              "Two size n/2 calls give 2W(n/2) plus combine work.",
              "State the input-size measure before writing a recurrence."
            ],
            code: "W_length(0) = O(1)\nW_length(n) = W_length(n - 1) + O(1)\nTherefore W_length(n) = O(n)"
          },
          {
            label: "Asymptotics",
            title: "Helpers contribute their own cost",
            body: "Do not count only recursive calls. Pattern matching, arithmetic, append, split, merge, and comparator calls all contribute to the nonrecursive term.",
            bullets: [
              "Append costs linear work in its left input.",
              "A supplied function may have nonconstant cost.",
              "Worst-case bounds use the most expensive valid input shape."
            ],
            code: "W_inorder(n) = W(left) + W(right) + O(size(left))"
          }
        ],
        check: {
          prompt: "What recurrence best models merge sort work on n elements?",
          options: [
            "W(n) = W(n - 1) + O(1)",
            "W(n) = 2W(n / 2) + O(n)",
            "W(n) = W(n / 2) + O(1)",
            "W(n) = O(1)"
          ],
          answer: 1,
          explanation: "Merge sort recursively sorts two halves and spends linear work splitting and merging."
        }
      },
      {
        title: "Span and parallel structure",
        slides: [
          {
            label: "Span",
            title: "Count the longest dependency chain",
            body: "Span S(n) assumes unlimited processors and measures the longest path through the task graph. Independent recursive calls contribute their maximum, not their sum.",
            bullets: [
              "Sequential calls add span.",
              "Parallel calls use max span.",
              "Low span exposes potential parallel speedup."
            ],
            code: "S_parallelTree(t) =\n  max(S(left), S(right)) + O(1)"
          },
          {
            label: "Balance",
            title: "Tree shape changes the bound",
            body: "A balanced binary tree has logarithmic depth; a maximally unbalanced tree has linear depth. A function with constant local work can therefore have O(log n) span on balanced trees and O(n) span in the worst case.",
            bullets: [
              "Depth is the natural measure for dependency chains.",
              "Work can remain O(n) for both shapes.",
              "Parallel speedup is at most work divided by span."
            ],
            code: "balanced: depth = O(log n)\nunbalanced: depth = O(n)"
          }
        ],
        check: {
          prompt: "Two recursive calls run in parallel with spans S1 and S2. What do they contribute before local work?",
          options: ["S1 + S2", "S1 * S2", "max(S1, S2)", "min(S1, S2)"],
          answer: 2,
          explanation: "Parallel branches proceed together, so completion waits only for the slower branch."
        }
      }
    ],
    practice: [
      {
        id: "cost-recurrence",
        title: "Derive both recurrences",
        difficulty: "Core",
        prompt: "For a balanced tree function that recursively processes both children in parallel and performs O(1) local work, write and solve its work and span recurrences in terms of node count n.",
        starter: "Work:\nW(1) =\nW(n) =\n\nSpan:\nS(1) =\nS(n) =\n\nBounds:",
        rubric: [
          "Includes both size n/2 recursive branches in work.",
          "Uses max or one branch in the span recurrence.",
          "Includes constant local work.",
          "Solves to linear work and logarithmic span."
        ]
      },
      {
        id: "cost-inorder",
        title: "Diagnose a slow traversal",
        difficulty: "Stretch",
        prompt: "Explain why the standard inorder implementation using @ may take quadratic work on some trees. Describe an accumulator-based repair and its target work bound.",
        starter: "fun inorder Empty = []\n  | inorder (Node (l, x, r)) =\n      inorder l @ (x :: inorder r)",
        rubric: [
          "Identifies append as linear in its left argument.",
          "Names an input shape that repeatedly triggers large appends.",
          "Describes threading an accumulator instead.",
          "States the repaired linear work target."
        ]
      }
    ]
  },
  {
    id: "polymorphism",
    phase: "Abstraction",
    title: "Type Inference and Polymorphism",
    lectures: "Lecture 8",
    source: "Lecture 8; HOFs HW type section; Final Review types",
    summary: "Infer most general types by assigning variables, collecting constraints, and preserving every unconstrained type component.",
    stages: [
      {
        title: "Constraint-based inference",
        slides: [
          {
            label: "Type variables",
            title: "Start unknown, then impose constraints",
            body: "Assign fresh type variables to unknown inputs and results. Each use contributes an equality constraint. Solve the constraints together to obtain the most general consistent type.",
            bullets: [
              "Arithmetic constrains operands to numeric types such as int.",
              "Application constrains the left expression to an arrow type.",
              "A tuple preserves independent component constraints."
            ],
            code: "fn f => fn x => f x\n\nx : 'a\nf : 'a -> 'b\nwhole : ('a -> 'b) -> 'a -> 'b"
          },
          {
            label: "Contradictions",
            title: "Conflicting constraints mean NWT",
            body: "An expression is ill-typed when one type variable is forced to be incompatible types. A branch not taken at runtime still contributes constraints during static type checking.",
            bullets: [
              "Using x with + may force x : int.",
              "Using the same x with ^ may force x : string.",
              "int = string has no solution, so the expression is NWT."
            ],
            code: "fn x => (x + 1, x ^ \"!\")\n\nx : int and x : string\nContradiction -> NWT"
          }
        ],
        check: {
          prompt: "What creates a polymorphic component in an inferred type?",
          options: [
            "A contradiction among constraints.",
            "No specific constraint fixes that component to a concrete type.",
            "Every use forces the component to int.",
            "The expression contains a tuple."
          ],
          answer: 1,
          explanation: "An unconstrained component remains a type variable, allowing the value to be instantiated at many concrete types."
        }
      },
      {
        title: "Most general types and let-polymorphism",
        slides: [
          {
            label: "MGT",
            title: "Keep every degree of freedom",
            body: "A most general type is the least restrictive type that describes the expression. More specific valid types are instances obtained by substituting concrete types for its variables.",
            bullets: [
              "'a list -> int is more general than int list -> int.",
              "Each use of a polymorphic binding may choose a fresh instance.",
              "Do not narrow a type merely because examples use ints."
            ],
            code: "length : 'a list -> int\n\ninstances:\nint list -> int\nstring list -> int"
          },
          {
            label: "Binding",
            title: "Polymorphism arrives after binding",
            body: "SML generalizes eligible values when they are bound. Inside one lambda application, a parameter has one monomorphic type, even if the expression passed to it could have been polymorphic as a separate binding.",
            bullets: [
              "A val-bound identity function can be used at several types.",
              "A lambda-bound parameter gets one type per call.",
              "When proving over a polymorphic type, instantiate an arbitrary type t."
            ],
            code: "val id = fn x => x\n(id 1, id true)  (* valid *)\n\n(fn f => (f 1, f true)) (fn x => x)  (* NWT *)"
          }
        ],
        check: {
          prompt: "Why can val id = fn x => x be used once on int and once on bool?",
          options: [
            "id changes its stored type after each call.",
            "Every function automatically has type 'a -> 'a.",
            "The bound polymorphic value is freshly instantiated at each use.",
            "int and bool unify."
          ],
          answer: 2,
          explanation: "After id is generalized at its binding, each use site may instantiate its type variable independently."
        }
      }
    ],
    practice: [
      {
        id: "poly-trace",
        title: "Full typing trace",
        difficulty: "Core",
        prompt: "Perform a typing trace for the expression. Assign fresh variables, list every constraint, solve them, and state the MGT.",
        starter: "fn f => fn (x, y) => (f x, f y)",
        rubric: [
          "Assigns fresh initial types to f, x, and y.",
          "Uses both applications to constrain x and y compatibly.",
          "Preserves an unconstrained result type.",
          "States the correct right-associated arrow type."
        ]
      },
      {
        id: "poly-contradiction",
        title: "Find the exact conflict",
        difficulty: "Core",
        prompt: "Determine whether the function is well-typed. If it is NWT, show the smallest conflicting set of constraints rather than only stating NWT.",
        starter: "fn g => fn x => if g x then x + 1 else x ^ \"!\"",
        rubric: [
          "Constrains g x to bool.",
          "Constrains x from both result branches.",
          "Identifies the int versus string conflict.",
          "Notes that both branches are type-checked."
        ]
      }
    ]
  },
  {
    id: "hofs-staging",
    phase: "Abstraction",
    title: "Higher-Order Functions and Staging",
    lectures: "Lectures 9-10",
    source: "Lectures 9-10; HOFs HW",
    summary: "Use currying, partial application, map, filter, composition, folds, pipes, and staged computation to parameterize code over code.",
    stages: [
      {
        title: "Currying and the HOF zoo",
        slides: [
          {
            label: "Currying",
            title: "Multiple arguments are nested lambdas",
            body: "A curried function returns another function after each argument. Function arrows associate right and application associates left, making partial application natural.",
            bullets: [
              "t1 -> t2 -> t3 means t1 -> (t2 -> t3).",
              "f x y means (f x) y.",
              "fun f x y = e is sugar for fn x => fn y => e."
            ],
            code: "fun add x y = x + y\nval addFive = add 5\n\nadd : int -> int -> int\naddFive : int -> int"
          },
          {
            label: "HOF zoo",
            title: "Map, filter, compose, and fold",
            body: "Higher-order functions capture recurring control-flow patterns. You supply the operation; the HOF owns the traversal or wiring.",
            bullets: [
              "map transforms every element.",
              "filter keeps elements satisfying a predicate.",
              "o composes functions.",
              "foldl and foldr replace list constructors with a combining operation."
            ],
            code: "map : ('a -> 'b) -> 'a list -> 'b list\nfilter : ('a -> bool) -> 'a list -> 'a list\nfoldr : ('a * 'b -> 'b) -> 'b -> 'a list -> 'b"
          }
        ],
        check: {
          prompt: "Given fun add x y = x + y, what is the type of add 5?",
          options: ["int", "int * int -> int", "int -> int", "'a -> 'a"],
          answer: 2,
          explanation: "Partial application supplies the first int and returns the remaining function from int to int."
        }
      },
      {
        title: "Fold direction, pipes, and staging",
        slides: [
          {
            label: "Folds",
            title: "Choose direction from the result shape",
            body: "foldr naturally rebuilds a list in order and can support short-circuiting patterns. foldl is naturally tail-recursive and threads an accumulator from left to right.",
            bullets: [
              "Use foldr when the output mirrors the input's cons structure.",
              "Use foldl for a running accumulator.",
              "Operand order matters for nonassociative operations."
            ],
            code: "foldr (op ::) [] [1,2,3] => [1,2,3]\nfoldl (op ::) [] [1,2,3] => [3,2,1]"
          },
          {
            label: "Staging",
            title: "Move reusable work before later arguments",
            body: "A deliberately staged function performs expensive work after early arguments, then returns a cheaper specialized function for repeated later calls. Pipes make left-to-right data flow readable.",
            bullets: [
              "Partial application chooses the reusable stage.",
              "The expensive computation must occur outside the returned lambda.",
              "The pipe operator passes a value into the next transformation."
            ],
            code: "fun prepare data =\n  let val indexed = expensive data\n  in fn query => lookup indexed query end\n\nvalue |> f |> g"
          }
        ],
        check: {
          prompt: "What makes a curried function deliberately staged?",
          options: [
            "Every argument is supplied at once.",
            "Reusable work happens before returning a function for later arguments.",
            "It uses only tail recursion.",
            "It has a polymorphic result."
          ],
          answer: 1,
          explanation: "Staging shifts reusable computation earlier so the partially applied function can reuse it across many later calls."
        }
      }
    ],
    practice: [
      {
        id: "hofs-fold",
        title: "Pick the fold",
        difficulty: "Core",
        prompt: "Implement keepAndSquareOdds : int list -> int list using only filter, map, composition or pipes. Then explain why the result preserves input order.",
        starter: "val keepAndSquareOdds =\n  (* your code *)",
        rubric: [
          "Uses higher-order library functions rather than explicit recursion.",
          "Filters exactly odd values.",
          "Squares each retained value.",
          "Explains why map and filter preserve relative order."
        ]
      },
      {
        id: "hofs-staged",
        title: "Stage repeated polynomial work",
        difficulty: "Stretch",
        prompt: "A polynomial is represented by a coefficient list. Write a curried prepareEval that preprocesses the list once, then returns a function that evaluates at many x values. Clearly identify the staged computation.",
        starter: "fun prepareEval coefficients =\n  let\n    (* work reused across calls *)\n  in\n    fn x => (* evaluate *)\n  end",
        rubric: [
          "The outer call performs a meaningful reusable computation.",
          "The returned function accepts the later x argument.",
          "Repeated calls do not repeat the preprocessing.",
          "The function is genuinely curried and the type is stated."
        ]
      }
    ]
  },
  {
    id: "cps",
    phase: "Control",
    title: "Pipelines and Continuation-Passing Style",
    lectures: "Lecture 11",
    source: "Lecture 11; CPS HW; Written CPS practice",
    summary: "Make the rest of the computation explicit as one or more continuations, and use them as functional accumulators.",
    stages: [
      {
        title: "One continuation",
        slides: [
          {
            label: "Continuations",
            title: "A continuation is what happens next",
            body: "Instead of returning a result, a CPS function passes the result to k. The continuation accumulates pending instructions as a function.",
            bullets: [
              "A simple CPS result type is controlled by k.",
              "Recursive calls should be in tail position.",
              "Values already available may be passed directly to k."
            ],
            code: "fun sumk [] k = k 0\n  | sumk (x :: xs) k =\n      sumk xs (fn rest => k (x + rest))"
          },
          {
            label: "Translation",
            title: "Replace explicit result bindings",
            body: "When direct style binds the result of a call, CPS passes a lambda that performs the remaining work. Translate from the outside in while preserving evaluation order.",
            bullets: [
              "Direct: val y = f x in g y.",
              "CPS: fk x (fn y => gk y k).",
              "Do not perform work after a recursive CPS call returns."
            ],
            code: "(* direct *)\nlet val y = f x in g y end\n\n(* CPS *)\nfk x (fn y => gk y k)"
          }
        ],
        check: {
          prompt: "In a CPS list sum, what role does fn rest => k (x + rest) play?",
          options: [
            "It stores the unprocessed list.",
            "It records the instruction to add x and continue.",
            "It catches exceptions.",
            "It makes x polymorphic."
          ],
          answer: 1,
          explanation: "The lambda is a functional accumulator containing the work that should occur after the recursive result becomes available."
        }
      },
      {
        title: "Two continuations and control flow",
        slides: [
          {
            label: "Options",
            title: "One continuation per result shape",
            body: "A direct-style function returning option can become a CPS function with success and failure continuations. Each constructor corresponds to calling one continuation.",
            bullets: [
              "SOME x becomes success x.",
              "NONE becomes failure ().",
              "No option value needs to be constructed."
            ],
            code: "fun findk p [] success failure = failure ()\n  | findk p (x :: xs) success failure =\n      if p x then success x\n      else findk p xs success failure"
          },
          {
            label: "Control flow",
            title: "Continuations choose the next path",
            body: "Multiple continuations can encode branching, backtracking, early exit, and parsing. A caller decides the behavior by choosing the continuation bodies.",
            bullets: [
              "Continuations may have different input types.",
              "All branches ultimately produce the same answer type.",
              "Passing a different continuation changes control flow without changing traversal code."
            ],
            code: "findk isEven xs\n  (fn n => \"found \" ^ Int.toString n)\n  (fn () => \"none\")"
          }
        ],
        check: {
          prompt: "How should a direct NONE result translate to two-continuation CPS?",
          options: ["return NONE", "call success NONE", "call failure ()", "raise Match"],
          answer: 2,
          explanation: "The failure continuation represents the NONE branch, so the CPS function calls it directly."
        }
      }
    ],
    practice: [
      {
        id: "cps-product",
        title: "Translate a list function",
        difficulty: "Core",
        prompt: "Translate product into single-continuation CPS. The recursive call must be in tail position, and your function may not bind its returned result.",
        starter: "fun product [] = 1\n  | product (x :: xs) = x * product xs\n\nfun productk xs k =\n  (* your code *)",
        rubric: [
          "Calls k on the base result.",
          "Adds multiplication inside a new continuation.",
          "Keeps the recursive call in tail position.",
          "Preserves the direct-style evaluation order."
        ]
      },
      {
        id: "cps-two",
        title: "Option to two continuations",
        difficulty: "Stretch",
        prompt: "Translate safeLast : 'a list -> 'a option into lastk with success and failure continuations. Do not construct SOME or NONE.",
        starter: "fun lastk xs success failure =\n  (* your code *)",
        rubric: [
          "The empty list calls failure.",
          "A singleton list calls success on its element.",
          "Longer lists recurse on the tail.",
          "No option constructors appear in the CPS implementation."
        ]
      }
    ]
  },
  {
    id: "exceptions",
    phase: "Control",
    title: "Exceptions and Exceptional Control Flow",
    lectures: "Lecture 12",
    source: "Lecture 12; Exceptions HW",
    summary: "Trace exception propagation, distinguish Match, Bind, and Fail, and use local exceptions for intentional nonlocal control flow.",
    stages: [
      {
        title: "The exn type and propagation",
        slides: [
          {
            label: "Exceptions",
            title: "exn is an extensible datatype",
            body: "An exception declaration adds a new constructor to the built-in exn type. Raising abandons the current computation and searches outward for the nearest matching handler.",
            bullets: [
              "exception Stop introduces Stop : exn.",
              "exception Bad of int introduces Bad : int -> exn.",
              "raise e can appear at any result type because it never returns normally."
            ],
            code: "exception BadInput of string\n\nfun parse s =\n  if s = \"\" then raise BadInput s else s"
          },
          {
            label: "Handling",
            title: "A handler wraps one expression",
            body: "e handle Pattern => recovery evaluates e first. If e raises a matching exception, recovery runs. Nonmatching exceptions continue propagating.",
            bullets: [
              "Handle is not a declaration.",
              "The normal result and each recovery branch share one type.",
              "Exceptions are effects and can break simple substitution reasoning."
            ],
            code: "(10 div 0) handle Div => 0\n\n(* result: 0 *)"
          }
        ],
        check: {
          prompt: "What happens when a handler pattern does not match the raised exception?",
          options: [
            "The expression returns NONE.",
            "The exception keeps propagating outward.",
            "SML converts it to Fail.",
            "The handler result becomes polymorphic."
          ],
          answer: 1,
          explanation: "Only a matching handler intercepts the exception. Otherwise the same exception continues to the next enclosing handler."
        }
      },
      {
        title: "Match, Bind, Fail, and deliberate exits",
        slides: [
          {
            label: "Built-ins",
            title: "Know which construct raises which exception",
            body: "Match comes from a failed case or function-clause match. Bind comes from a failed val pattern. Fail is normally raised explicitly, often with a message.",
            bullets: [
              "case [] of x :: xs => x raises Match.",
              "val x :: xs = [] raises Bind.",
              "raise Fail \"oops\" raises Fail \"oops\"."
            ],
            code: "val x :: xs = []       (* Bind *)\ncase [] of x :: xs => x  (* Match *)\nraise Fail \"oops\"        (* Fail \"oops\" *)"
          },
          {
            label: "Control",
            title: "A local exception can exit many stack frames",
            body: "A function may raise a private exception when it finds an answer, then handle it around the whole traversal. This performs an early exit without returning through every recursive frame.",
            bullets: [
              "Declare the exception in the narrowest useful scope.",
              "Carry data in the exception payload when needed.",
              "Keep normal failure distinct from programmer errors."
            ],
            code: "fun first p xs =\n  let exception Found of int\n      fun loop [] = NONE\n        | loop (x :: rest) =\n            if p x then raise Found x else loop rest\n  in loop xs handle Found x => SOME x end"
          }
        ],
        check: {
          prompt: "Which construct raises Bind when its pattern fails?",
          options: ["case expression", "function clause", "val pattern declaration", "raise Fail"],
          answer: 2,
          explanation: "A failed pattern in a val declaration raises Bind; failed case or function-clause matching raises Match."
        }
      }
    ],
    practice: [
      {
        id: "exceptions-trace",
        title: "Trace nested handlers",
        difficulty: "Core",
        prompt: "State the type and outcome of the expression. Show which handler, if any, catches the exception.",
        starter: "((10 div 0) handle Match => 7)\n  handle Div => 9\n       | Fail _ => 11",
        rubric: [
          "Identifies Div as the raised exception.",
          "Explains why the inner handler does not match.",
          "Shows propagation to the outer handler.",
          "States the final int result."
        ]
      },
      {
        id: "exceptions-control",
        title: "Early tree search",
        difficulty: "Stretch",
        prompt: "Write existsFast on a binary tree using a local exception to exit as soon as the predicate succeeds. The normal result should be bool.",
        starter: "fun existsFast p tree =\n  let\n    exception Found\n    fun visit t =\n      (* your code *)\n  in\n    (* run and handle *)\n  end",
        rubric: [
          "Uses a local exception with narrow scope.",
          "Raises immediately on a satisfying node.",
          "Visits both subtrees when needed.",
          "Handles the exception to return true and otherwise returns false."
        ]
      }
    ]
  },
  {
    id: "regex",
    phase: "Control",
    title: "Languages and Regular Expressions",
    lectures: "Lecture 13",
    source: "Lecture 13; Regex HW and Regex Lab",
    summary: "Build languages recursively from regular-expression constructors and trace the continuation-based matcher, especially concatenation, star, and intersection.",
    stages: [
      {
        title: "Alphabets, strings, and languages",
        slides: [
          {
            label: "Vocabulary",
            title: "A language is a set of strings",
            body: "An alphabet Sigma is a finite set of symbols. A string is a finite sequence over Sigma, including the empty string epsilon. A language is any set of such strings.",
            bullets: [
              "Sigma* is the set of all finite strings over Sigma.",
              "epsilon has length zero.",
              "Regular expressions denote languages, not individual searches."
            ],
            code: "Sigma = {a, b}\nstrings: epsilon, a, ab, bba, ...\nlanguage: { strings ending in a }"
          },
          {
            label: "Constructors",
            title: "Regex languages are built recursively",
            body: "The core constructors denote the empty language, epsilon, one character, union, concatenation, and Kleene star. Course extensions may add intersection.",
            bullets: [
              "Alt combines either language.",
              "Concat splits a string between two languages.",
              "Star repeats a language zero or more times.",
              "Both requires membership in both languages."
            ],
            code: "Zero | One | Char c\nAlt(r, s) | Concat(r, s)\nStar r | Both(r, s)"
          }
        ],
        check: {
          prompt: "What language does Star r always contain, regardless of r?",
          options: ["The empty language", "Only one-character strings", "epsilon", "Every string"],
          answer: 2,
          explanation: "Kleene star permits zero repetitions, so the empty string epsilon is always included."
        }
      },
      {
        title: "Matcher continuations",
        slides: [
          {
            label: "Matcher",
            title: "The continuation consumes the suffix",
            body: "A matcher for r does not merely return yes or no. It tries to consume a prefix matching r, then passes the unconsumed suffix to a continuation that represents the rest of the specification.",
            bullets: [
              "One succeeds only without consuming input.",
              "Char c consumes one matching symbol.",
              "Concat matches the left regex, then continues by matching the right."
            ],
            code: "match (Concat (r, s)) cs k =\n  match r cs (fn rest => match s rest k)"
          },
          {
            label: "Search",
            title: "Continuations support choices and backtracking",
            body: "Alt tries alternatives, and Star may try different repetition counts. Both must ensure the same consumed prefix satisfies both regexes before giving the shared suffix to k.",
            bullets: [
              "The final continuation often checks that the suffix is empty.",
              "Progress checks prevent Star from looping on empty matches.",
              "A too-lenient Both may let its branches consume different prefixes."
            ],
            code: "accept r cs = match r cs (fn rest => null rest)"
          }
        ],
        check: {
          prompt: "In match r cs k, what does k receive after r matches a prefix?",
          options: ["The matched prefix", "The original regex", "The unconsumed suffix", "A bool only"],
          answer: 2,
          explanation: "The continuation receives the remaining characters so it can enforce the rest of the desired match."
        }
      }
    ],
    practice: [
      {
        id: "regex-build",
        title: "Construct a language",
        difficulty: "Core",
        prompt: "Using only the course regex constructors, define the language over {a,b} containing strings with exactly two a characters and any number of b characters around or between them.",
        starter: "val exactlyTwoA =\n  (* regexp expression *)",
        rubric: [
          "Requires exactly two occurrences of a.",
          "Allows zero or more b characters in all three regions.",
          "Does not accept a third a.",
          "Uses constructor semantics correctly."
        ]
      },
      {
        id: "regex-match",
        title: "Trace the continuation matcher",
        difficulty: "Stretch",
        prompt: "Trace accept (Concat (Star (Char #\"a\"), Char #\"b\")) [#\"a\", #\"a\", #\"b\"]. Name the suffix passed at each important continuation step.",
        starter: "Initial input:\nStar choices:\nSuffix given to Char b:\nFinal continuation:",
        rubric: [
          "Explains how Star explores repetition counts.",
          "Identifies the successful suffix before matching b.",
          "Shows b consuming the last character.",
          "Shows the final continuation accepting only the empty suffix."
        ]
      }
    ]
  },
  {
    id: "modules",
    phase: "Systems",
    title: "Structures, Signatures, and Abstraction",
    lectures: "Lecture 14",
    source: "Lecture 14; Modules HW signature and ascription tasks",
    summary: "Separate implementation from interface using structures, signatures, transparent or opaque ascription, and representation invariants.",
    stages: [
      {
        title: "Namespaces and interfaces",
        slides: [
          {
            label: "Structures",
            title: "A structure groups related declarations",
            body: "Structures create namespaces for types, values, exceptions, and nested modules. Clients access exported members with qualified names.",
            bullets: [
              "Structures organize implementations.",
              "A structure may contain hidden helper declarations.",
              "Opening a structure changes name lookup but not its definition."
            ],
            code: "structure Counter = struct\n  type t = int\n  val zero = 0\n  fun next n = n + 1\nend\n\nCounter.next Counter.zero"
          },
          {
            label: "Signatures",
            title: "A signature states the client contract",
            body: "A signature lists the components clients may rely on. Matching checks that the structure supplies compatible components, while extra implementation details can remain hidden.",
            bullets: [
              "val specifications expose value types.",
              "type specifications expose or abstract types.",
              "A signature is an interface, not an implementation."
            ],
            code: "signature COUNTER = sig\n  type t\n  val zero : t\n  val next : t -> t\nend"
          }
        ],
        check: {
          prompt: "What is the main role of a signature?",
          options: [
            "To execute a structure.",
            "To state the components and types clients may depend on.",
            "To make every type equal to int.",
            "To replace pattern matching."
          ],
          answer: 1,
          explanation: "A signature is the module interface: it controls and documents the components visible to clients."
        }
      },
      {
        title: "Ascription and representation independence",
        slides: [
          {
            label: "Ascription",
            title: "Transparent and opaque views differ",
            body: "Transparent ascription keeps type equalities visible when the signature permits them. Opaque ascription seals abstract types so clients cannot depend on the concrete representation.",
            bullets: [
              ": is transparent ascription.",
              ":> is opaque ascription.",
              "Opaque sealing is central to information hiding."
            ],
            code: "structure A : COUNTER = Impl\nstructure B :> COUNTER = Impl"
          },
          {
            label: "Abstraction",
            title: "Clients reason from operations, not representation",
            body: "A representation invariant describes valid internal states. Representation independence says two implementations are interchangeable when clients using only the signature cannot distinguish them.",
            bullets: [
              "Keep constructors hidden when clients could violate invariants.",
              "Expose observers and constructors through the signature.",
              "Changing representation should not force client rewrites."
            ],
            code: "(* list-backed and tree-backed sets can share one SET interface *)"
          }
        ],
        check: {
          prompt: "What does opaque ascription primarily prevent?",
          options: [
            "Calling exported functions.",
            "Compiling the structure.",
            "Clients relying on hidden concrete type equalities.",
            "Using polymorphic values."
          ],
          answer: 2,
          explanation: "Opaque sealing hides the concrete representation of abstract types, preserving the abstraction boundary."
        }
      }
    ],
    practice: [
      {
        id: "modules-signature",
        title: "Design a safe signature",
        difficulty: "Core",
        prompt: "Write a signature for a nonempty stack abstraction. Expose t, singleton, push, top, and pop. Keep the concrete representation hidden and choose option results where emptiness could arise after pop.",
        starter: "signature STACK = sig\n  (* specifications *)\nend",
        rubric: [
          "Declares an abstract element-parameterized or clearly fixed element type.",
          "Keeps the stack representation abstract.",
          "Gives compatible types to singleton, push, top, and pop.",
          "Uses option where the operation may fail."
        ]
      },
      {
        id: "modules-ascription",
        title: "Transparent or opaque?",
        difficulty: "Stretch",
        prompt: "For each client need below, choose transparent or opaque ascription and justify it: (1) clients must know t = int for arithmetic; (2) clients must never construct invalid t values.",
        starter: "1. Choice and reason:\n2. Choice and reason:",
        rubric: [
          "Chooses transparent when the concrete equality is intentionally public.",
          "Chooses opaque when invariant protection matters.",
          "Explains consequences for client type checking.",
          "Distinguishes interface visibility from implementation existence."
        ]
      }
    ]
  },
  {
    id: "functors-rbt",
    phase: "Systems",
    title: "Functors and Red-Black Trees",
    lectures: "Lectures 15-16",
    source: "Lectures 15-16; Modules HW functor tasks",
    summary: "Parameterize modules over modules, then use type and color invariants to maintain logarithmic balanced-tree operations.",
    stages: [
      {
        title: "Modules parameterized by modules",
        slides: [
          {
            label: "Functors",
            title: "A functor maps input structures to output structures",
            body: "A functor accepts a structure matching an input signature and produces a new structure. This lets an implementation depend on operations and types supplied by another module.",
            bullets: [
              "The input signature states requirements.",
              "The result may be constrained by an output signature.",
              "Applying a functor generates a structure."
            ],
            code: "functor MkDict (Key : ORDERED) :> DICT = struct\n  type key = Key.t\n  (* implementation uses Key.compare *)\nend"
          },
          {
            label: "Sharing",
            title: "Type relationships must be stated",
            body: "A useful functor interface often needs where type constraints so the result's public types relate to the input structure's types.",
            bullets: [
              "Abstract types from unrelated modules are distinct by default.",
              "where type can reveal a required equality.",
              "Opaque result sealing can still preserve selected equalities."
            ],
            code: "functor MkDict (Key : ORDERED)\n  :> DICT where type key = Key.t"
          }
        ],
        check: {
          prompt: "What must a structure satisfy before it can be passed to a functor?",
          options: [
            "It must use lists internally.",
            "It must match the functor's input signature.",
            "It must be opaquely ascribed.",
            "It must export every declaration it contains."
          ],
          answer: 1,
          explanation: "The input signature is the functor's contract for the supplied structure."
        }
      },
      {
        title: "Red-black invariants",
        slides: [
          {
            label: "Invariants",
            title: "Color rules bound the height",
            body: "A red-black tree is a binary search tree with coloring constraints. The root and leaves are black, red nodes have black children, and every root-to-leaf path has the same black height.",
            bullets: [
              "The ordering invariant still governs keys.",
              "No red-red edge prevents long red chains.",
              "Equal black height keeps paths within a constant factor."
            ],
            code: "datatype color = R | B\ndatatype 'a rbt = E | T of color * 'a rbt * 'a * 'a rbt"
          },
          {
            label: "Balancing",
            title: "Repair only the local red-red shapes",
            body: "Functional insertion first behaves like BST insertion with a red leaf, then balance repairs one of four symmetric red-red configurations. The final root is blackened.",
            bullets: [
              "Balance is local pattern matching.",
              "Rotations preserve inorder key order.",
              "Blackening the root restores the root invariant."
            ],
            code: "insert x t = blacken (ins x t)\n\n(* balance handles LL, LR, RL, RR red-red cases *)"
          }
        ],
        check: {
          prompt: "Which red-black invariant directly forbids a red node with a red child?",
          options: [
            "Every leaf is empty.",
            "The root is black.",
            "Red nodes have black children.",
            "Keys are polymorphic."
          ],
          answer: 2,
          explanation: "That invariant eliminates consecutive red nodes and is repaired by the local balance cases."
        }
      }
    ],
    practice: [
      {
        id: "functor-interface",
        title: "Type a dictionary functor",
        difficulty: "Core",
        prompt: "Sketch the input signature ORDERED and a functor header for MkSet. The resulting set's element type must equal the input structure's t.",
        starter: "signature ORDERED = sig\n  (* ... *)\nend\n\nfunctor MkSet (Element : ORDERED)\n  :> SET where type elem = (* ... *) =\nstruct\n  (* implementation omitted *)\nend",
        rubric: [
          "ORDERED exposes type t and a comparison operation.",
          "The functor parameter is constrained by ORDERED.",
          "The result is constrained by SET.",
          "A where type equation connects elem to Element.t."
        ]
      },
      {
        id: "rbt-trace",
        title: "Check an insertion trace",
        difficulty: "Stretch",
        prompt: "Insert keys 3, 2, 1 into an initially empty red-black tree. Describe the temporary violation, the balance case used, and the final colors and shape.",
        starter: "After inserting 3:\nAfter inserting 2:\nAfter inserting 1:\nRepair:\nFinal tree:",
        rubric: [
          "Maintains BST ordering throughout.",
          "Identifies the left-left red-red configuration.",
          "Describes the rotation/recoloring correctly.",
          "Ends with a black root and valid black heights."
        ]
      }
    ]
  },
  {
    id: "sequences",
    phase: "Parallel",
    title: "Sequences and Parallel Cost",
    lectures: "Lecture 17",
    source: "Lecture 17; Sequences Lab; Final Review sequence tasks",
    summary: "Use the sequence abstraction and its work-span contracts to express parallel map, tabulate, filter, reduce, scan, and flatten computations.",
    stages: [
      {
        title: "The sequence abstraction",
        slides: [
          {
            label: "Sequences",
            title: "A sequence hides its representation",
            body: "A sequence is an ordered finite collection with an abstract representation. Use Seq operations rather than list constructors or pattern matching.",
            bullets: [
              "Seq.length reports the size.",
              "Seq.nth reads by index under a valid-bound precondition.",
              "Seq.tabulate builds elements from their indices."
            ],
            code: "Seq.tabulate : (int -> 'a) -> int -> 'a Seq.seq\nSeq.nth : 'a Seq.seq -> int -> 'a"
          },
          {
            label: "Parallel map",
            title: "Independent element work can run together",
            body: "Sequence operations expose parallel structure. Mapping a function over n elements performs all n applications in total work, while the applications may run in parallel.",
            bullets: [
              "Include the supplied function's work and span.",
              "The sequence library's contract controls overhead.",
              "Representation remains hidden behind the interface."
            ],
            code: "Seq.map f <x0, x1, ..., xn-1>\n= <f x0, f x1, ..., f xn-1>"
          }
        ],
        check: {
          prompt: "Why should sequence code use Seq operations instead of list pattern matching?",
          options: [
            "Sequences can contain only ints.",
            "The sequence representation is abstract and its API carries cost guarantees.",
            "Pattern matching is always quadratic.",
            "Sequences are exceptions."
          ],
          answer: 1,
          explanation: "Clients must respect the abstraction boundary, and the documented sequence operations provide the intended parallel behavior and costs."
        }
      },
      {
        title: "Reduce and cost composition",
        slides: [
          {
            label: "Reduce",
            title: "Balanced combination lowers span",
            body: "A sequence reduction combines elements with an associative operation using a balanced tree of calls. Associativity allows regrouping without changing the result.",
            bullets: [
              "A reduction needs an identity or base value.",
              "Nonassociative operations cannot be freely parallelized this way.",
              "Balanced combination gives logarithmic combining depth."
            ],
            code: "Seq.reduce (op +) 0 <1,2,3,4>\n\n(1 + 2) and (3 + 4), then combine"
          },
          {
            label: "Cost",
            title: "Substitute client-function costs",
            body: "Higher-order sequence contracts are parameterized by the work and span of their functional arguments. A constant-time f gives one bound; an expensive f changes the final expression.",
            bullets: [
              "Map work includes n applications of f.",
              "Map span includes the maximum application span plus overhead.",
              "Nested sequence operations require careful summation over inner sizes."
            ],
            code: "W_map = O(n * W_f)\nS_map = O(S_f + log n)  (* use the course library contract *)"
          }
        ],
        check: {
          prompt: "What property is essential for a parallel reduce operator?",
          options: ["It must return bool.", "It must be associative.", "It must raise exceptions.", "It must be curried."],
          answer: 1,
          explanation: "Associativity permits the library to regroup combinations into a balanced tree without changing the result."
        }
      }
    ],
    practice: [
      {
        id: "sequences-tabulate",
        title: "Build an index sequence",
        difficulty: "Core",
        prompt: "Using Seq.tabulate, create the sequence <0, 1, 4, 9, ..., (n-1)^2>. State the work and span in terms of n under constant-time arithmetic.",
        starter: "fun squares n =\n  (* Seq.tabulate ... *)\n\nWork:\nSpan:",
        rubric: [
          "Uses the index argument supplied by tabulate.",
          "Builds exactly n elements.",
          "Squares each index correctly.",
          "Applies the course tabulate cost contract."
        ]
      },
      {
        id: "sequences-pipeline",
        title: "Parallel aggregate",
        difficulty: "Stretch",
        prompt: "Write a sequence pipeline that keeps positive numbers, squares them, and sums them. Then express its work and span using the documented costs of filter, map, and reduce.",
        starter: "fun positiveSquareSum s =\n  (* sequence pipeline *)\n\nWork:\nSpan:",
        rubric: [
          "Uses sequence filter, map, and reduce appropriately.",
          "Supplies a valid associative reducer and identity.",
          "Counts all three operation costs.",
          "Distinguishes total work from dependency depth."
        ]
      }
    ]
  },
  {
    id: "lazy-imperative",
    phase: "Effects",
    title: "Laziness, Streams, and References",
    lectures: "Lectures 18-19",
    source: "Lectures 18-19; Lazy and Imperative review tasks",
    summary: "Control when computations occur with suspensions and streams, then trace mutable reference cells and aliasing explicitly.",
    stages: [
      {
        title: "Delayed computation and streams",
        slides: [
          {
            label: "Laziness",
            title: "A suspension packages work for later",
            body: "Delay creates a suspended computation; force requests its result. A memoizing suspension evaluates at most once and reuses the stored result on later forces.",
            bullets: [
              "Delayed code is not executed at construction time.",
              "Forcing too early defeats laziness.",
              "Memoization changes repeated-force cost."
            ],
            code: "val delayed = delay (fn () => expensive 42)\n(* expensive runs when delayed is forced *)"
          },
          {
            label: "Streams",
            title: "A stream reveals one cell at a time",
            body: "An infinite stream can be represented by a current element and a suspended tail. Consumers must request only a finite prefix or otherwise establish a stopping condition.",
            bullets: [
              "The tail must remain suspended.",
              "take n forces at most the first n cells.",
              "Mapping a stream constructs a lazy transformed stream."
            ],
            code: "datatype 'a stream = Cons of 'a * (unit -> 'a stream)\n\nfun from n = Cons (n, fn () => from (n + 1))"
          }
        ],
        check: {
          prompt: "What prevents constructing an infinite stream from looping immediately?",
          options: [
            "The head is an exception.",
            "The recursive tail is wrapped in a delayed function.",
            "The stream uses references.",
            "The element type is polymorphic."
          ],
          answer: 1,
          explanation: "The recursive computation for the tail is suspended, so constructing one cell does not recursively build the entire infinite stream."
        }
      },
      {
        title: "References and aliasing",
        slides: [
          {
            label: "Refs",
            title: "A ref value names a mutable cell",
            body: "ref e allocates a cell, !r reads it, and r := e updates it. The assignment expression returns unit. The type 'a ref describes a location storing an 'a value.",
            bullets: [
              "ref : 'a -> 'a ref.",
              "! : 'a ref -> 'a.",
              ":= : 'a ref * 'a -> unit."
            ],
            code: "val count = ref 0\ncount := !count + 1\n!count => 1"
          },
          {
            label: "Aliasing",
            title: "Two names may point to one cell",
            body: "Binding s = r copies the reference value, not the stored contents. Updating through either alias changes the one shared cell, which breaks ordinary substitution and referential transparency.",
            bullets: [
              "ref 0 and ref 0 allocate distinct cells.",
              "val s = r makes s and r aliases.",
              "Evaluation order becomes observable when mutations occur."
            ],
            code: "val r = ref 0\nval s = r\ns := 7\n!r => 7"
          }
        ],
        check: {
          prompt: "After val r = ref 0; val s = r; s := 7, what is !r?",
          options: ["0", "7", "unit", "NWT"],
          answer: 1,
          explanation: "r and s are aliases for the same mutable cell, so updating through s changes the value read through r."
        }
      }
    ],
    practice: [
      {
        id: "lazy-take",
        title: "Consume a finite prefix",
        difficulty: "Core",
        prompt: "Write take : int -> 'a stream -> 'a list for the stream representation below. Force no more tails than necessary.",
        starter: "datatype 'a stream = Cons of 'a * (unit -> 'a stream)\n\nfun take 0 _ = []\n  | take n (Cons (x, tail)) =\n      (* your code *)",
        rubric: [
          "Returns immediately when n is zero.",
          "Includes the current head for positive n.",
          "Forces exactly the tail needed for the recursive step.",
          "Produces a finite list in stream order."
        ]
      },
      {
        id: "refs-trace",
        title: "Draw the store",
        difficulty: "Core",
        prompt: "Trace the bindings and heap cells after every declaration. State the final pair and identify all aliases.",
        starter: "val a = ref 2\nval b = a\nval c = ref (!a)\nb := 5\nval result = (!a, !c)",
        rubric: [
          "Distinguishes bindings from allocated cells.",
          "Shows a and b pointing to the same cell.",
          "Shows c pointing to a separate cell initialized with 2.",
          "Computes the final pair correctly."
        ]
      }
    ]
  },
  {
    id: "async",
    phase: "Effects",
    title: "Callbacks, Promises, and Async Programs",
    lectures: "Lecture 20",
    source: "Lecture 20; Final Review async material",
    summary: "Recognize the boundary between immediate results and future results, then sequence asynchronous work with callbacks and promises.",
    stages: [
      {
        title: "Crossing the wall",
        slides: [
          {
            label: "Async",
            title: "Some results do not exist yet",
            body: "An asynchronous operation begins now and completes later. Code cannot return the eventual value synchronously; it must provide a callback or a promise representing future completion.",
            bullets: [
              "I/O completion time is outside the caller's control.",
              "Blocking wastes the opportunity to do other work.",
              "The result type must reveal its asynchronous nature."
            ],
            code: "// Incorrect mental model\nconst text = fetchText(url); // result is not ready yet\n\n// Future result\nconst textPromise = fetchText(url);"
          },
          {
            label: "Callbacks",
            title: "Pass the rest of the work",
            body: "A callback is a continuation invoked when an asynchronous operation completes. Nested callback structure makes sequencing explicit but can become difficult to compose and propagate errors through.",
            bullets: [
              "The callback receives the completed result.",
              "Independent operations may start together.",
              "Error paths need their own handling."
            ],
            code: "readFile(path, (error, text) => {\n  if (error) handle(error);\n  else use(text);\n});"
          }
        ],
        check: {
          prompt: "Why can an asynchronous fetch not simply return its eventual response value immediately?",
          options: [
            "Responses are always exceptions.",
            "The function completes before the external operation produces the value.",
            "JavaScript has no function values.",
            "Promises are mutable references."
          ],
          answer: 1,
          explanation: "The external operation has not completed when the initiating function returns, so the future result must be represented explicitly."
        }
      },
      {
        title: "Promise chains",
        slides: [
          {
            label: "Promises",
            title: "A promise represents pending completion",
            body: "A promise is pending, fulfilled with a value, or rejected with an error. then composes success continuations; catch handles rejection.",
            bullets: [
              "then returns a new promise.",
              "Returning a promise from then flattens the chain.",
              "Thrown errors reject the next promise."
            ],
            code: "fetch(url)\n  .then(response => response.text())\n  .then(text => parse(text))\n  .catch(error => report(error));"
          },
          {
            label: "Composition",
            title: "Sequence dependencies, parallelize independence",
            body: "Operations that depend on earlier results belong in a chain. Independent promises can start together and be joined later. The dependency graph, not source indentation, determines available parallelism.",
            bullets: [
              "Use Promise.all for independent future values.",
              "Do not accidentally serialize independent requests.",
              "Always account for rejection and cleanup."
            ],
            code: "const [user, courses] = await Promise.all([\n  loadUser(),\n  loadCourses()\n]);"
          }
        ],
        check: {
          prompt: "What does a then callback return when it starts another asynchronous operation needed by the next step?",
          options: [
            "Nothing; the chain waits automatically.",
            "The new promise.",
            "A mutable reference.",
            "The original callback."
          ],
          answer: 1,
          explanation: "Returning the new promise makes the next then wait for that dependent asynchronous operation."
        }
      }
    ],
    practice: [
      {
        id: "async-trace",
        title: "Trace a promise chain",
        difficulty: "Core",
        prompt: "For the chain below, list the order of callbacks and the value or error carried by each resulting promise.",
        starter: "Promise.resolve(3)\n  .then(x => x + 2)\n  .then(x => { throw new Error(String(x)); })\n  .catch(_ => 10)\n  .then(x => x * 2);",
        rubric: [
          "Starts from a fulfilled value of 3.",
          "Tracks the fulfilled value after the first then.",
          "Recognizes the thrown error as a rejection.",
          "Shows catch recovery and the final fulfilled value."
        ]
      },
      {
        id: "async-parallel",
        title: "Expose independent work",
        difficulty: "Stretch",
        prompt: "Rewrite the sequential code so loadProfile and loadAssignments start in parallel, then render after both complete. Include one error path.",
        starter: "async function loadPage() {\n  const profile = await loadProfile();\n  const assignments = await loadAssignments();\n  render(profile, assignments);\n}",
        rubric: [
          "Starts both independent operations before waiting.",
          "Uses Promise.all or an equivalent join.",
          "Preserves the final render inputs.",
          "Includes clear rejection handling."
        ]
      }
    ]
  }
];

window.PREP_BADGES = [
  { id: "first-check", title: "First constraint", detail: "Pass one checkpoint", icon: "badge-check", test: stats => stats.completedStages >= 1 },
  { id: "type-tracer", title: "Type tracer", detail: "Finish polymorphism", icon: "braces", test: stats => stats.completedModules.includes("polymorphism") },
  { id: "control-flow", title: "Control flow", detail: "Finish CPS and exceptions", icon: "split", test: stats => stats.completedModules.includes("cps") && stats.completedModules.includes("exceptions") },
  { id: "module-maker", title: "Module maker", detail: "Finish both module units", icon: "boxes", test: stats => stats.completedModules.includes("modules") && stats.completedModules.includes("functors-rbt") },
  { id: "parallel-mind", title: "Parallel mind", detail: "Finish sequences", icon: "git-fork", test: stats => stats.completedModules.includes("sequences") },
  { id: "course-clear", title: "Course clear", detail: "Finish all modules", icon: "crown", test: stats => stats.completedModules.length === window.COURSE_MODULES.length }
];

window.DEMO_LEADERBOARD = [
  { username: "LambdaLover", xp: 1820, completed_modules: 13 },
  { username: "TailCall", xp: 1650, completed_modules: 12 },
  { username: "PolyMorphic", xp: 1480, completed_modules: 10 },
  { username: "SeqRunner", xp: 1310, completed_modules: 9 },
  { username: "RedBlackReady", xp: 1180, completed_modules: 8 },
  { username: "FoldRight", xp: 940, completed_modules: 7 },
  { username: "CPSuccess", xp: 760, completed_modules: 5 }
];
