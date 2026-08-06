import os
import re

target_dir = r"src\app\teacher"

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # replace text-[10px] sm:text-xs with text-xs sm:text-sm
            new_content = content.replace("text-[10px] sm:text-xs", "text-xs sm:text-sm")
            # replace remaining text-[10px] with text-xs
            new_content = new_content.replace("text-[10px]", "text-xs")
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {path}")
