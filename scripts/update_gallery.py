import os
import re

# Configuration
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_FILE = os.path.join(PROJECT_ROOT, 'product', 'index.html')
IMAGES_DIR = os.path.join(PROJECT_ROOT, 'assets', 'images', 'products_categories')
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.jfif'}

def get_slug(folder_name):
    # Mapping based on existing Liquid logic
    if folder_name == "Awning":
        return "awnings"
    if folder_name == "Custom":
        return "custom-work"
    if folder_name == "Vinyl":
        return "vinyls"
    
    # Default: downcase and replace spaces with dashes
    return folder_name.lower().replace(" ", "-")

def generate_gallery_html():
    html_lines = []
    
    # Walk the directory
    for root, dirs, files in os.walk(IMAGES_DIR):
        for file in sorted(files):
            if os.path.splitext(file)[1].lower() in IMAGE_EXTENSIONS:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, IMAGES_DIR)
                
                # Determine folder_name (category)
                # Logic: if in subfolder, use subfolder name. If in root, use filename (seems to be the logic)
                parts = rel_path.split(os.sep)
                if len(parts) > 1:
                    folder_name = parts[0]
                else:
                    folder_name = file
                
                slug = get_slug(folder_name)
                
                # Construct relative path for HTML from product/index.html
                # Image at assets/images/products_categories/...
                # HTML at product/index.html
                # Path: ../assets/images/products_categories/{rel_path}
                # Ensure forward slashes for HTML
                web_path = f"../assets/images/products_categories/{rel_path}".replace(os.sep, '/')
                
                html_snippet = f'''            <article class="gallery-card" data-category="{slug}" role="listitem">
              <div class="gallery-media">
                <img src="{web_path}" alt="{folder_name} photo" loading="lazy">
              </div>
            </article>'''
                html_lines.append(html_snippet)
    
    return "\n".join(html_lines)

def update_file():
    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    marker_start = "<!-- GALLERY_START -->"
    marker_end = "<!-- GALLERY_END -->"
    
    # Regex to replace content between markers
    pattern = re.compile(f'({re.escape(marker_start)})(.*?)({re.escape(marker_end)})', re.DOTALL)
    
    new_gallery_content = "\n" + generate_gallery_html() + "\n            "
    
    if pattern.search(content):
        new_content = pattern.sub(f'\\1{new_gallery_content}\\3', content)
        
        with open(HTML_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {HTML_FILE} with gallery items.")
    else:
        print(f"Markers {marker_start}...{marker_end} not found in {HTML_FILE}")

if __name__ == "__main__":
    update_file()
