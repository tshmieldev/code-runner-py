from usercode import add

class Test:
    def __init__(self, name, func, args, expected, points):
        self.name = name
        self.func = func
        self.args = args
        self.expected = expected
        self.points = points
    
    def run(self):
        try:
            result = self.func(*self.args)
            if result == self.expected:
                return {'points': self.points, 'error': None, 'expected': self.expected, 'result': result}
            else:
                return {'points': 0, 'error': None, 'expected': self.expected, 'result': result}
        except Exception as e:
            return {'points': 0, 'error': str(e), 'expected': self.expected, 'result': None}

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
        
        return {
            'success': True,
            'message': f"All tests passed! Total points: {total_points}",
            'results': results,
            'total_points': total_points,
            'max_points': sum(test.points for test in Tester.tests)
        }

Tester.tests = [
    Test("add(1, 2) == 3", add, (1, 2), 3, 1),
    Test("add(1, -2) == -1", add, (1, -2), -1, 1),
    Test("add(-1, -2) == -3", add, (-1, -2), -3, 1),
    Test("add(0, 0) == 0", add, (0, 0), 0, 1),
    Test("add(1, 0) == 1", add, (1, 0), 1, 1),
    Test("add(0, 1) == 1", add, (0, 1), 1, 1),
    Test("add(1, 1) == 2", add, (1, 1), 2, 1),
]

def test():
    return Tester.run()

