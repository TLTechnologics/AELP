import os
import re

directories = [
    r"src\app\skills",
    r"src\app\teacher",
    r"src\app\profile"
]

def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace massive headings that overflow on mobile
    content = content.replace('text-5xl md:text-6xl font-heading', 'text-4xl md:text-5xl lg:text-6xl font-heading break-words')
    content = content.replace('text-4xl md:text-6xl font-heading', 'text-4xl md:text-5xl lg:text-6xl font-heading break-words')
    content = content.replace('text-3xl sm:text-5xl', 'text-3xl sm:text-4xl md:text-5xl break-words')
    
    # Fix teacher class-analytics heatmap tables overflowing
    content = content.replace('<div className="overflow-x-auto">', '<div className="overflow-x-auto w-full">')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                update_file(os.path.join(root, file))

print("Typography fixes applied!")
