import time
import sys
import tracemalloc
from usercode import add

class PerformanceTest:
    def __init__(self, name, func, args, test_type, iterations, max_time=None, max_memory=None, points=1):
        self.name = name
        self.func = func
        self.args = args
        self.test_type = test_type  # 'time', 'memory', 'both'
        self.iterations = iterations
        self.max_time = max_time  # Maximum allowed time in seconds
        self.max_memory = max_memory  # Maximum allowed memory in MB
        self.points = points
    
    def run(self):
        try:
            if self.test_type in ['time', 'both']:
                time_result = self._measure_time()
                if self.max_time and time_result['avg_time'] > self.max_time:
                    return {
                        'points': 0,
                        'error': f"Time limit exceeded: {time_result['avg_time']:.6f}s > {self.max_time}s",
                        'metrics': time_result,
                        'passed': False
                    }
            
            if self.test_type in ['memory', 'both']:
                memory_result = self._measure_memory()
                if self.max_memory and memory_result['peak_memory'] > self.max_memory:
                    return {
                        'points': 0,
                        'error': f"Memory limit exceeded: {memory_result['peak_memory']:.2f}MB > {self.max_memory}MB",
                        'metrics': memory_result,
                        'passed': False
                    }
            
            # Combine results based on test type
            metrics = {}
            if self.test_type == 'time':
                metrics = time_result
            elif self.test_type == 'memory':
                metrics = memory_result
            elif self.test_type == 'both':
                metrics = {**time_result, **memory_result}
            
            return {
                'points': self.points,
                'error': None,
                'metrics': metrics,
                'passed': True
            }
            
        except Exception as e:
            return {
                'points': 0,
                'error': f"Runtime error: {str(e)}",
                'metrics': {},
                'passed': False
            }
    
    def _measure_time(self):
        times = []
        
        # Warm-up run
        self.func(*self.args)
        
        # Actual measurements
        for _ in range(min(self.iterations, 10)):  # Limit to 10 samples for time measurement
            start = time.perf_counter()
            
            if self.iterations <= 10:
                # Single call measurement
                self.func(*self.args)
            else:
                # Multiple calls measurement
                calls_per_sample = self.iterations // 10
                for _ in range(calls_per_sample):
                    self.func(*self.args)
            
            end = time.perf_counter()
            times.append(end - start)
        
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        
        # If we did multiple calls per sample, calculate per-call time
        if self.iterations > 10:
            calls_per_sample = self.iterations // 10
            avg_time /= calls_per_sample
            min_time /= calls_per_sample
            max_time /= calls_per_sample
        
        return {
            'avg_time': avg_time,
            'min_time': min_time,
            'max_time': max_time,
            'iterations': self.iterations
        }
    
    def _measure_memory(self):
        tracemalloc.start()
        
        # Execute the function
        if self.iterations <= 1000:
            for _ in range(self.iterations):
                self.func(*self.args)
        else:
            # For high iteration counts, measure a sample
            for _ in range(1000):
                self.func(*self.args)
        
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        return {
            'current_memory': current / 1024 / 1024,  # Convert to MB
            'peak_memory': peak / 1024 / 1024,        # Convert to MB
            'iterations': min(self.iterations, 1000)
        }

class PerformanceTester:
    tests = []
    
    @staticmethod
    def run():
        total_points = 0
        results = []
        
        for test in PerformanceTester.tests:
            result = test.run()
            result['name'] = test.name
            results.append(result)
            total_points += result['points']
            
            if result['error']:
                return {
                    'success': False,
                    'message': f"Performance test failed: {test.name} - {result['error']}",
                    'results': results,
                    'total_points': total_points,
                    'max_points': sum(test.points for test in PerformanceTester.tests)
                }
        
        return {
            'success': True,
            'message': f"All performance tests passed! Total points: {total_points}",
            'results': results,
            'total_points': total_points,
            'max_points': sum(test.points for test in PerformanceTester.tests)
        }

# Instructor-defined performance tests
PerformanceTester.tests = [
    # Time-based tests
    PerformanceTest(
        name="Single call should be fast",
        func=add,
        args=(1, 2),
        test_type='time',
        iterations=1,
        max_time=0.001,  # 1ms
        points=2
    ),
    
    PerformanceTest(
        name="1M calls should complete quickly",
        func=add,
        args=(1, 2),
        test_type='time',
        iterations=1_000_000,
        max_time=0.1,  # 100ms for 1M calls
        points=3
    ),
    
    # Memory-based tests
    PerformanceTest(
        name="Memory usage should be minimal",
        func=add,
        args=(1, 2),
        test_type='memory',
        iterations=1000,
        max_memory=1.0,  # 1MB
        points=2
    ),
    
    # Combined tests
    PerformanceTest(
        name="Overall efficiency test",
        func=add,
        args=(100, 200),
        test_type='both',
        iterations=10_000,
        max_time=0.01,   # 10ms
        max_memory=0.5,  # 500KB
        points=3
    )
]

def performance_test():
    return PerformanceTester.run()