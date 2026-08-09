import os
import requests
from docx import Document
from docx.shared import Inches

# --- CONFIGURATION ---
UNSPLASH_ACCESS_KEY = "GQ7p__8sgKbA7_8lVcw6fUa9BgStoUpWTe_g7QkX4ks"
DOCX_FILE = "Universal_access_grid_qatar_uganda_proposal.docx"
OUTPUT_FILE = "Universal_access_grid_qatar_uganda_proposal_With_Images.docx"

# Search queries for Unsplash
SEARCH_QUERIES = [
    "rural uganda community water crisis dry well",
    "karamoja pastoralists water trough cattle africa",
    "uganda refugee settlement water kiosk solar pump",
    "clean drinking water point rural africa community"
]

def download_image(query, filename):
    url = f"https://api.unsplash.com/search/photos?query={query}&per_page=1&client_id={UNSPLASH_ACCESS_KEY}"
    try:
        res = requests.get(url).json()
        if res.get("results"):
            img_url = res["results"][0]["urls"]["regular"]
            img_data = requests.get(img_url).content
            with open(filename, "wb") as f:
                f.write(img_data)
            return True
    except Exception as e:
        print(f"Error downloading image for '{query}': {e}")
    return False

def replace_placeholders():
    if not os.path.exists(DOCX_FILE):
        print(f"Error: Could not find '{DOCX_FILE}'. Make sure the file name matches exactly.")
        return

    doc = Document(DOCX_FILE)
    image_index = 0

    for paragraph in doc.paragraphs:
        if "PHOTO PLACEHOLDER" in paragraph.text.upper() or "[PHOTO:" in paragraph.text.upper():
            if image_index < len(SEARCH_QUERIES):
                query = SEARCH_QUERIES[image_index]
                temp_filename = f"temp_img_{image_index}.jpg"
                
                print(f"Fetching image {image_index + 1}/{len(SEARCH_QUERIES)} for: '{query}'...")
                
                if download_image(query, temp_filename):
                    paragraph.text = ""
                    run = paragraph.add_run()
                    run.add_picture(temp_filename, width=Inches(5.5))
                    print(f"Successfully inserted image {image_index + 1}!")
                    image_index += 1
                
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)

    doc.save(OUTPUT_FILE)
    print(f"\nFinished! Output saved as: {OUTPUT_FILE}")

if __name__ == "__main__":
    replace_placeholders()