from performancelib import PerformanceTest, PerformanceTester

# Instructor-defined performance tests
PerformanceTester.tests = [
    # Time-based tests
    PerformanceTest(
        name="Single call should be fast",
        args=(1, 2),
        test_type='time',
        iterations=1,
        max_time=0.001,  # 1ms
        points=2
    ),
    
    PerformanceTest(
        name="1M calls should complete quickly",
        args=(1, 2),
        test_type='time',
        iterations=1_000_000,
        max_time=0.1,  # 100ms for 1M calls
        points=3
    ),
    
    # Memory-based tests
    PerformanceTest(
        name="Memory usage should be minimal",
        args=(1, 2),
        test_type='memory',
        iterations=1000,
        max_memory=1.0,  # 1MB
        points=2
    ),
    
    # Combined tests
    PerformanceTest(
        name="Overall efficiency test",
        args=(100, 200),
        test_type='both',
        iterations=10_000,
        max_time=0.01,   # 10ms
        max_memory=0.5,  # 500KB
        points=3
    )
]

def performance_test(solution):
    return PerformanceTester.run(solution)