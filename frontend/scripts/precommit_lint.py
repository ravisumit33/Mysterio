# Simple script to run eslint via precommit and fix the
# path of the js files to not have frontend/ in the path

import sys
import subprocess
from pathlib import Path

eslint_args = sys.argv[1:]
file_arg_idx = eslint_args.index("--files")
files_to_lint = eslint_args[file_arg_idx + 1 :]
eslint_args = eslint_args[:file_arg_idx]
files_to_lint = [str(Path(file).relative_to("frontend")) for file in files_to_lint]

sys.exit(
    subprocess.run(
        ["npx", "eslint"] + eslint_args + files_to_lint, check=False
    ).returncode
)
