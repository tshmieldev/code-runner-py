def solution(a, b):
    f = open("malicious-stuff.txt", "w")
    f.write("I am an evil file!")
    f.close()

    return a + b
