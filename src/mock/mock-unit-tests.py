from unittestlib import Test, Tester

Tester.tests = [
    Test("add(1, 2) == 3", (1, 2), 3, 1),
    Test("add(1, -2) == -1", (1, -2), -1, 1),
    Test("add(-1, -2) == -3", (-1, -2), -3, 1),
    Test("add(0, 0) == 0", (0, 0), 0, 1),
    Test("add(1, 0) == 1", (1, 0), 1, 1),
    Test("add(0, 1) == 1", (0, 1), 1, 1),
    Test("add(1, 1) == 2", (1, 1), 2, 1),
]

def test(solution):
    return Tester.run(solution)


