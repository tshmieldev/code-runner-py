import contextlib
import json
import os
import sys
import io
import time

from unittests import test

try:
    from usercode import solution
except ImportError:
    sys.__stdout__.write(
        json.dumps(
            {
                "runalyzer_errors": "Solution function not found.",
                "test_result": None,
                "stdout": None,
                "stderr": None,
                "truncated": False,
            }
        )
    )
    exit(1)

MAX_LENGTH = 1024


def truncate_output(output, max_chars=256):
    """Truncate output to max_chars and add ... if needed"""
    if len(output) <= max_chars:
        return output
    return output[: max_chars - 3] + "..."


if __name__ == "__main__":
    # Capture stdout and stderr
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()

    test_res = None

    try:
        with (
            contextlib.redirect_stdout(stdout_capture),
            contextlib.redirect_stderr(stderr_capture),
        ):
            start = time.process_time()
            test_res = test(solution)
            end = time.process_time()
            duration = end - start

    except Exception as e:
        sys.__stderr__.write(str(e))
        exit(1)

    # Get captured output and truncate
    stdout_data = truncate_output(stdout_capture.getvalue(), MAX_LENGTH)
    stderr_data = truncate_output(stderr_capture.getvalue(), MAX_LENGTH)

    # Redirect further output to /dev/null
    with open(os.devnull, "w") as devnull:
        with contextlib.redirect_stdout(devnull), contextlib.redirect_stderr(devnull):
            # Print final results (this goes to the original stdout before redirection)
            sys.__stdout__.write(
                json.dumps(
                    {
                        "test_result": test_res,
                        "stdout": stdout_data,
                        "stderr": stderr_data,
                        "duration": duration,
                        "truncated": len(stdout_capture.getvalue()) > MAX_LENGTH
                        or len(stderr_capture.getvalue()) > MAX_LENGTH,
                    }
                )
            )
