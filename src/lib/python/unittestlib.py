import os
import contextlib


class Test:
    def __init__(
        self, name, args, expected, points, equalityFunc=None, is_secret=False
    ):
        self.name = name
        self.args = args
        self.expected = expected
        self.points = points
        self.is_secret = is_secret
        self.equalityFunc = equalityFunc or (lambda x, y: x == y)

    def run(self, solution):
        try:
            if self.is_secret:
                with open(os.devnull, "w") as devnull:
                    with (
                        contextlib.redirect_stdout(devnull),
                        contextlib.redirect_stderr(devnull),
                    ):
                        result = solution(*self.args)
            else:
                result = solution(*self.args)
                print(f"Test: {self.name}: {result}")
            if isinstance(result, type(self.expected)) and self.equalityFunc(
                result, self.expected
            ):
                if self.is_secret:
                    return {
                        "name": "Ukryty test",
                        "points": self.points,
                        "max_points": self.points,
                        "error": None,
                        "expected": "N/A",
                        "result": "N/A",
                        "is_secret": True,
                    }
                else:
                    return {
                        "name": self.name,
                        "points": self.points,
                        "max_points": self.points,
                        "error": None,
                        "expected": self.expected,
                        "result": result,
                    }
            else:
                if self.is_secret:
                    return {
                        "name": "Ukryty test",
                        "points": 0,
                        "max_points": self.points,
                        "error": None,
                        "expected": "N/A",
                        "result": "N/A",
                        "is_secret": True,
                    }
                else:
                    return {
                        "name": self.name,
                        "points": 0,
                        "max_points": self.points,
                        "error": None,
                        "expected": self.expected,
                        "result": result,
                    }
        except Exception as e:
            if self.is_secret:
                return {
                    "name": "Ukryty test",
                    "points": 0,
                    "max_points": self.points,
                    "error": str(e),
                    "expected": "N/A",
                    "result": None,
                    "is_secret": True,
                }


class Tester:
    tests = []

    @staticmethod
    def run(solution):
        total_points = 0
        results = []
        for test in Tester.tests:
            result = test.run(solution)
            results.append(result)
            total_points += result["points"]
            if result["error"]:
                return {
                    "success": False,
                    "message": result["error"],
                    "results": results,
                    "total_points": total_points,
                }
        max_points = sum(test.points for test in Tester.tests)
        return {
            "success": True,
            "message": f"Punkty: {total_points} / {max_points}",
            "results": results,
            "total_points": total_points,
            "max_points": max_points,
        }
