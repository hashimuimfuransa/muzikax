with open(r'c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 151 - replace the duplicated line with the correct one
lines[151] = '      "", // Preserve empty values so we can show fallback in UI\n'

# Write back to file
with open(r'c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("File fixed successfully!")