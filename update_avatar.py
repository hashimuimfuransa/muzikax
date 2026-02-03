with open(r'c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Update line 151 to remove the fallback URL for avatar
lines[150] = '      creator.avatar || "", // Preserve empty values so we can show fallback in UI\n'

# Write back to file
with open(r'c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("File updated successfully!")