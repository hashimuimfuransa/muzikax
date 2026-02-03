with open(r'c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix the avatar assignment - replace lines 150 and 151 with the correct implementation
lines[150] = '      creator.avatar || ""  // Preserve empty values so we can show fallback in UI\n'
# Remove the duplicate line 151
del lines[151]

# Write back to file
with open(r'c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("File fixed successfully!")