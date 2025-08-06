import os
import contextlib
from usercode import solution

class Test:
    def __init__(self, name, func, args, expected, points, is_secret=False):
        self.name = name
        self.func = func
        self.args = args
        self.expected = expected
        self.points = points
        self.is_secret = is_secret
    def run(self):
        try:
            if self.is_secret:
                with open(os.devnull, 'w') as devnull:
                    with contextlib.redirect_stdout(devnull),                          contextlib.redirect_stderr(devnull):
                        result = self.func(*self.args)
            else:
                result = self.func(*self.args)
                print(f"Test: {self.name}: {result}")
            if result == self.expected:
                if self.is_secret:
                    return {'name' : 'Ukryty test', 'points': self.points, 'max_points': self.points, 'error': None, 'expected': 'N/A', 'result': 'N/A', 'is_secret': True}
                else:
                    return {'name': self.name, 'points': self.points, 'max_points': self.points, 'error': None, 'expected': self.expected, 'result': result}
            else:
                if self.is_secret:
                    return {'name': 'Ukryty test', 'points': 0, 'max_points': self.points, 'error': None, 'expected': 'N/A', 'result': 'N/A', 'is_secret': True}
                else:
                    return {'name': self.name, 'points': 0, 'max_points': self.points, 'error': None, 'expected': self.expected, 'result': result}
        except Exception as e:
            if self.is_secret:
                return {'name': 'Ukryty test', 'points': 0, 'max_points': self.points, 'error': str(e), 'expected': 'N/A', 'result': None, 'is_secret': True}
            else:
                return {'name': self.name, 'points': 0, 'max_points': self.points, 'error': str(e), 'expected': self.expected, 'result': None}

class Tester:
    tests = []
    
    @staticmethod
    def run():
        total_points = 0
        results = []
        for test in Tester.tests:
            result = test.run()
            results.append(result)
            total_points += result['points']
            if result['error']:
                return {
                    'success': False,
                    'message': result['error'],
                    'results': results,
                    'total_points': total_points
                }
        max_points = sum(test.points for test in Tester.tests)
        return {
            'success': True,
            'message': f"Total points: {total_points} / {max_points}",
            'results': results,
            'total_points': total_points,
            'max_points': max_points
        }

Tester.tests = [
    Test("add(1, 2) == 3", solution, (1, 2), 3, 1),
    Test("add(1, -2) == -1", solution, (1, -2), -1, 1),
    Test("add(-1, -2) == -3", solution, (-1, -2), -3, 1),
    Test("add(0, 0) == 0", solution, (0, 0), 0, 1),
    Test("add(1, 0) == 1", solution, (1, 0), 1, 1),
    Test("add(0, 1) == 1", solution, (0, 1), 1, 1),
    Test("add(1, 1) == 2", solution, (1, 1), 2, 1),
]

def test():
    return Tester.run()


