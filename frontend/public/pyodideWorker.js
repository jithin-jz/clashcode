/* eslint-disable no-undef */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js");

let pyodide = null;
let isReady = false;

const EXECUTION_TIMEOUT = 10000; // 10 seconds

/* ================= PYODIDE INITIALIZATION ================= */

async function initPyodide() {
  try {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
    });

    await pyodide.loadPackage("micropip");

    // Set up stdout/stderr handlers
    pyodide.setStdout({
      batched: (msg) => postMessage({ type: "log", content: msg }),
    });

    pyodide.setStderr({
      batched: (msg) => postMessage({ type: "error", content: msg }),
    });

    // Bootstrap security and utility functions
    await bootstrapPython();

    isReady = true;
    postMessage({ type: "ready" });
  } catch (err) {
    postMessage({
      type: "error",
      content: `Failed to initialize Pyodide: ${err.toString()}`,
    });
  }
}

/* ================= BOOTSTRAP PYTHON ENVIRONMENT ================= */

const BOOTSTRAP_SCRIPT = `
import ast
import sys

# Blocked imports and builtins for security
BLOCKED_IMPORTS = {
    'os', 'sys', 'subprocess', 'shutil', 'importlib',
    'socket', 'requests', 'urllib', 'http', 'ftplib',
    'pathlib', 'glob'
}

BLOCKED_BUILTINS = {
    'exec', 'eval', 'compile', 'open', 'input', '__import__'
}

class SecurityAnalyzer(ast.NodeVisitor):
    """AST visitor to detect disallowed operations"""
    def __init__(self):
        self.errors = []

    def visit_Import(self, node):
        for alias in node.names:
            module_name = alias.name.split('.')[0]
            if module_name in BLOCKED_IMPORTS:
                self.errors.append(f"Importing '{alias.name}' is not allowed")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            module_name = node.module.split('.')[0]
            if module_name in BLOCKED_IMPORTS:
                self.errors.append(f"Importing from '{node.module}' is not allowed")
        self.generic_visit(node)

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in BLOCKED_BUILTINS:
                self.errors.append(f"Calling '{node.func.id}()' is not allowed")
        self.generic_visit(node)

def is_safe_code(code):
    """Check if code is safe to execute"""
    try:
        tree = ast.parse(code)
        analyzer = SecurityAnalyzer()
        analyzer.visit(tree)

        if analyzer.errors:
            return False, "; ".join(analyzer.errors)
        return True, None
    except SyntaxError as e:
        return False, f"Syntax Error: {e}"
    except Exception as e:
        return False, f"Parse Error: {e}"

# Store initial global state for cleanup
_INITIAL_GLOBALS = set(globals().keys())

def cleanup_globals():
    """Clean up user-defined globals while preserving system functions"""
    current_keys = set(globals().keys())
    keep = _INITIAL_GLOBALS | {
        'cleanup_globals', 'is_safe_code', 'SecurityAnalyzer',
        'BLOCKED_IMPORTS', 'BLOCKED_BUILTINS', '_INITIAL_GLOBALS'
    }
    for key in current_keys:
        if key not in keep and not key.startswith('_'):
            try:
                del globals()[key]
            except:
                pass

print("Python environment bootstrapped successfully")
`;

async function bootstrapPython() {
  try {
    await pyodide.runPythonAsync(BOOTSTRAP_SCRIPT);
  } catch (err) {
    throw new Error(`Bootstrap failed: ${err.toString()}`);
  }
}

/* ================= TIMEOUT WRAPPER ================= */

function executeWithTimeout(fn, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `⏱️ Execution timed out after ${timeoutMs / 1000}s. Check for infinite loops!`,
        ),
      );
    }, timeoutMs);

    Promise.resolve(fn())
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

/* ================= SAFE CODE EXECUTION ================= */

async function executeSafely(code, timeoutMs = EXECUTION_TIMEOUT) {
  if (!pyodide || !isReady) {
    throw new Error("Pyodide is not ready");
  }

  // Check code safety using globals.get() — avoids string escaping bugs
  const checkSafe = pyodide.globals.get("is_safe_code");
  const result = checkSafe(code);
  const [isSafe, errorMsg] = result.toJs();
  result.destroy();

  if (!isSafe) {
    throw new Error(`🛡️ Security Violation: ${errorMsg}`);
  }

  // Clean previous execution state
  const cleanup = pyodide.globals.get("cleanup_globals");
  cleanup();

  // Execute code with timeout
  return await executeWithTimeout(
    () => pyodide.runPythonAsync(code),
    timeoutMs,
  );
}

/* ================= MESSAGE HANDLER ================= */

self.onmessage = async (event) => {
  const { type, code, testCode } = event.data;

  if (!pyodide || !isReady) {
    postMessage({
      type: "error",
      content: "⚠️ Pyodide is not ready yet. Please wait...",
    });
    return;
  }

  try {
    switch (type) {
      case "run":
        await handleRun(code);
        break;

      case "validate":
        await handleValidate(code, testCode);
        break;

      default:
        postMessage({
          type: "error",
          content: `Unknown message type: ${type}`,
        });
    }
  } catch (err) {
    postMessage({
      type: "error",
      content: err.message || err.toString(),
    });
    postMessage({ type: "completed", passed: false });
  }
};

/* ================= RUN MODE ================= */

async function handleRun(code) {
  try {
    await executeSafely(code);
    postMessage({ type: "completed", passed: false }); // 'run' doesn't complete challenges
  } catch (err) {
    postMessage({
      type: "error",
      content: err.message || err.toString(),
    });
    postMessage({ type: "completed", passed: false });
  }
}

/* ================= VALIDATE MODE ================= */

async function handleValidate(code, testCode) {
  if (!testCode) {
    postMessage({
      type: "error",
      content: "No test code provided for validation",
    });
    postMessage({ type: "completed", passed: false });
    return;
  }

  try {
    // Capture stdout from user code
    let capturedOutput = [];

    pyodide.setStdout({
      batched: (msg) => {
        capturedOutput.push(msg);
        postMessage({ type: "log", content: msg });
      },
    });

    // 1. Execute user code (with security check + timeout)
    await executeSafely(code);

    // 2. Store captured output for test code access
    const outputStr = capturedOutput.join("\n");
    pyodide.globals.set("output", outputStr);

    // 3. Execute test assertions
    try {
      await executeWithTimeout(
        () => pyodide.runPythonAsync(testCode),
        EXECUTION_TIMEOUT,
      );
    } catch (testErr) {
      const errorMsg = testErr.message || testErr.toString();
      throw new Error(errorMsg);
    }

    // 4. Run check() function if test code defined one
    const hasCheck = await pyodide.runPythonAsync(
      "'check' in globals() and callable(check)",
    );

    if (hasCheck) {
      // Build a scope dict with user-defined variables + output
      await executeWithTimeout(
        () =>
          pyodide.runPythonAsync(`
_output = output if 'output' in globals() else ''
_user_scope = {k: v for k, v in globals().items() if not k.startswith('_')}
_user_scope['output'] = _output
check(_user_scope)
`),
        EXECUTION_TIMEOUT,
      );
    }

    // All tests passed
    postMessage({ type: "success", content: "✅ All tests passed!" });
    postMessage({ type: "completed", passed: true });
  } catch (err) {
    const errorMsg = err.message || err.toString();
    const isSecurityError = errorMsg.includes("🛡️");

    const displayMsg = isSecurityError
      ? errorMsg
      : `❌ Test failed: ${errorMsg}`;

    postMessage({
      type: "error",
      content: displayMsg,
    });
    postMessage({ type: "completed", passed: false });
  } finally {
    // Restore default stdout handler
    pyodide.setStdout({
      batched: (msg) => postMessage({ type: "log", content: msg }),
    });
  }
}

/* ================= START INITIALIZATION ================= */

initPyodide();
