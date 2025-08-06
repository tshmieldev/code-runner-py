import contextlib
import json
import os
import sys
import io
from unittests import test


def truncate_output(output, max_chars=256):
    """Truncate output to max_chars and add ... if needed"""
    if len(output) <= max_chars:
        return output
    return output[:max_chars-3] + "..."

if __name__ == "__main__":
    # Capture stdout and stderr
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    test_res = None
    
    try:
        with contextlib.redirect_stdout(stdout_capture), \
             contextlib.redirect_stderr(stderr_capture):
            test_res = test()
            
    except Exception as e:
        test_res = {'success': False, 'message': f'Runtime error: {str(e)}'}

    # Get captured output and truncate
    stdout_data = truncate_output(stdout_capture.getvalue(), 1024)
    stderr_data = truncate_output(stderr_capture.getvalue(), 1024)
    
    # Redirect further output to /dev/null
    with open(os.devnull, 'w') as devnull:
        with contextlib.redirect_stdout(devnull), \
             contextlib.redirect_stderr(devnull):
            
            # Print final results (this goes to the original stdout before redirection)
            sys.__stdout__.write(json.dumps({
                'test_result': test_res,
                'stdout': stdout_data,
                'stderr': stderr_data,
                'truncated': len(stdout_capture.getvalue()) > 1024 or len(stderr_capture.getvalue()) > 1024
            }))