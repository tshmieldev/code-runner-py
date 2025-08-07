import os
import contextlib
import time
import tracemalloc

class PerformanceTest:
    def __init__(self, name, args, test_type, iterations, max_time=None, max_memory=None, points=1):
        self.name = name
        self.args = args
        self.test_type = test_type  # 'time', 'memory', 'both'
        self.iterations = iterations
        self.max_time = max_time  # Maximum allowed time in seconds
        self.max_memory = max_memory  # Maximum allowed memory in MB
        self.points = points
    
    def run(self, solution):
        with open(os.devnull, 'w') as devnull:
            with contextlib.redirect_stdout(devnull), contextlib.redirect_stderr(devnull):
                try:
                    
                    if self.test_type in ['time', 'both']:
                        time_result = self._measure_time(solution)
                        if self.max_time and time_result['avg_time'] > self.max_time:
                            return {
                                'points': 0,
                                'max_points': self.points,
                                'error': None,
                                'message': f"Przekroczono limit czasu: {time_result['avg_time']:.6f}s > {self.max_time}s",
                                'metrics': time_result,
                            }
                    
                    if self.test_type in ['memory', 'both']:
                        memory_result = self._measure_memory(solution)
                        if self.max_memory and memory_result['peak_memory'] > self.max_memory:
                            return {
                                'points': 0,
                                'max_points': self.points,
                                'error': None,
                                'message': f"Przekroczono limit pamięci: {memory_result['peak_memory']:.2f}MB > {self.max_memory}MB",
                                'metrics': memory_result,
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
                        'max_points': self.points,
                        'error': None,
                        'metrics': metrics,
                    }
                    
                except Exception as e:
                    return {
                        'points': 0,
                        'max_points': self.points,
                        'message': None,
                        'error': f"Błąd wykonania: {str(e)}",
                        'metrics': {},
                    }
    
    def _measure_time(self, solution):
        times = []
        
        # Warm-up run
        solution(*self.args)
        
        # Actual measurements
        for _ in range(min(self.iterations, 10)):  # Limit to 10 samples for time measurement
            start = time.process_time()
            
            if self.iterations <= 10:
                # Single call measurement
                solution(*self.args)
            else:
                # Multiple calls measurement
                calls_per_sample = self.iterations // 10
                for _ in range(calls_per_sample):
                    solution(*self.args)
            
            end = time.process_time()
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
            #'iterations': self.iterations
        }
    
    def _measure_memory(self, solution):
        tracemalloc.start()
        
        # Execute the function
        if self.iterations <= 1000:
            for _ in range(self.iterations):
                solution(*self.args)
        else:
            # For high iteration counts, measure a sample
            for _ in range(1000):
                solution(*self.args)
        
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        return {
            'avg_memory': current / 1024 / 1024,  # Convert to MB
            'peak_memory': peak / 1024 / 1024,        # Convert to MB
            #'iterations': min(self.iterations, 1000)
        }

class PerformanceTester:
    tests = []
    
    @staticmethod
    def run(solution):
        total_points = 0
        results = []
        max_points = sum(test.points for test in PerformanceTester.tests)
        for test in PerformanceTester.tests:
            result = test.run(solution)
            result['name'] = test.name
            results.append(result)
            total_points += result['points']
            
            if result['error']:
                return {
                    'success': False,
                    'message': f"Test wydajnościowy nie przeszedł: {test.name} - {result['error']}",
                    'results': results,
                    'total_points': total_points,
                    'max_points': max_points
                }
        if total_points == max_points:
            return {
                'success': True,
                'message': f"Punkty: {total_points} / {max_points}",
                'results': results,
                'total_points': total_points,
                'max_points': max_points
            }
        else:
            return {
                'success': False,
                'message': f"Punkty: {total_points} / {max_points}",
                'results': results,
                'total_points': total_points,
                'max_points': max_points
            }
