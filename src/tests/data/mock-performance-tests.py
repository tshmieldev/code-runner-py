from unittestlib import Test, Tester
import random

for i in range(100):
    arr = [random.randint(1, 10000) for _ in range(random.randint(500, 1000))]
    Tester.tests.append(Test(f"sorting arr[{len(arr)}]", (arr,), sorted(arr), 1))


def test(solution):
    return Tester.run(solution)
