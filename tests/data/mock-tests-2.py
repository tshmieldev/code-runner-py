from unittestlib import Test, Tester


class LinkedList:
    def __init__(self, value):
        self.value = value
        self.next = None

    def __str__(self):
        return f"LinkedList({self.value})"


Tester.tests = [
    Test(
        "LinkedList(1) == LinkedList(1)",
        (1,),
        LinkedList(1),
        1,
        equalityFunc=lambda x, y: x.value == y.value,
    ),
]


def test(solution):
    return Tester.run(solution)
