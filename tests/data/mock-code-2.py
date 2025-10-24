class LinkedList:
    def __init__(self, value):
        self.value = value
        self.next = None

    def __str__(self):
        return f"LinkedList({self.value})"


def solution(value):
    return LinkedList(value)
