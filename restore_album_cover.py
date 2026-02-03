# Read the file
with open(r'c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Restore the album cover URL that was incorrectly changed
old_line = '      "", // Preserve empty values so we can show fallback in UI'
new_line = '      "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",'

# Replace the line
content = content.replace(old_line, new_line, 1)  # Only replace the first occurrence

# Write back to file
with open(r'c:\Users\Lenovo\muzikax\frontend\src\app\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Album cover restored successfully!")