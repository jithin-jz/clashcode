import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class PistonExecutionService:
    """
    Service for executing code via the Piston engine.
    """

    PISTON_URL = getattr(settings, "PISTON_URL", "http://piston:2000/api/v2/execute")

    @classmethod
    def execute_code(cls, language, code, version="*", stdin="", args=None):
        """
        Executes code using Piston and returns the result.
        """
        payload = {
            "language": language,
            "version": version,
            "files": [
                {
                    "content": code
                }
            ],
            "stdin": stdin,
            "args": args or []
        }

        try:
            response = requests.post(cls.PISTON_URL, json=payload, timeout=15)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Piston execution failed: {str(e)}")
            return {
                "run": {
                    "stdout": "",
                    "stderr": f"System Error: Could not connect to code execution engine. {str(e)}",
                    "code": -1,
                    "signal": None,
                    "output": ""
                }
            }

    @classmethod
    def run_tests(cls, language, code, test_cases, version="*"):
        """
        Runs code against a set of test cases.
        Expects test_cases to be a list of dicts with 'input' and 'expected_output'.
        """
        results = []
        all_passed = True

        for tc in test_cases:
            res = cls.execute_code(language, code, version=version, stdin=tc.get("input", ""))
            
            # Simple string comparison for now. 
            # In a real app, you might want to strip trailing whitespace or handle precision.
            actual_output = res.get("run", {}).get("stdout", "").strip()
            expected_output = tc.get("expected_output", "").strip()
            
            passed = actual_output == expected_output
            if not passed:
                all_passed = False
                
            results.append({
                "input": tc.get("input"),
                "expected": expected_output,
                "actual": actual_output,
                "passed": passed,
                "stderr": res.get("run", {}).get("stderr", "")
            })

        return {
            "all_passed": all_passed,
            "test_results": results
        }
