import os
import contextlib


def defaultequalityfn(x, y):
    return x == y


class Test:
    def __init__(
        self,
        name,
        args,
        expected,
        points,
        equalityFunc=None,
        is_secret=False,
    ):
        self.name = name
        self.args = args
        self.expected = expected
        self.points = points
        self.is_secret = is_secret
        self.equalityFunc = equalityFunc or defaultequalityfn

    def run(self, solution):
        if self.is_secret:
            with open(os.devnull, "w") as devnull:
                with (
                    contextlib.redirect_stdout(devnull),
                    contextlib.redirect_stderr(devnull),
                ):
                    result = solution(*self.args)
        else:
            result = solution(*self.args)
            # This is to help students debug their code (their prints are not split by tests, so this helps)
            print(f"-- Test: {self.name}: {result} --")
        if (
            # If you override the equality function, type checking is on you!
            self.equalityFunc != defaultequalityfn
            or type(result) is type(self.expected)
        ) and self.equalityFunc(result, self.expected):
            return {
                "name": "Ukryty test" if self.is_secret else self.name,
                "points": self.points,
                "max_points": self.points,
                "expected": "N/A" if self.is_secret else str(self.expected),
                "result": "N/A" if self.is_secret else str(result),
                "is_secret": self.is_secret,
            }
        else:
            return {
                "name": "Ukryty test" if self.is_secret else self.name,
                "points": 0,
                "max_points": self.points,
                "expected": "N/A" if self.is_secret else str(self.expected),
                "result": "N/A" if self.is_secret else str(result),
                "is_secret": self.is_secret,
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

        max_points = sum(test.points for test in Tester.tests)
        return {
            "success": total_points == max_points,
            "message": f"Punkty: {total_points} / {max_points}",
            "results": results,
            "total_points": total_points,
            "max_total_points": max_points,
        }
