from PIL import Image
import os

def add_padding(input_path, output_path, padding_percent=0.25):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Calculate new size based on padding
        # padding_percent is applied to EACH side, effectively doubling the canvas relative to the image content
        # For adaptive icons, we want the logo to be about 66-72% of the full size.
        # So new_size = old_size / 0.66 approx.
        
        new_width = int(width * (1 + padding_percent * 2))
        new_height = int(height * (1 + padding_percent * 2))
        
        # Create a new transparent image
        new_img = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
        
        # Paste the original image in the center
        x_offset = (new_width - width) // 2
        y_offset = (new_height - height) // 2
        
        new_img.paste(img, (x_offset, y_offset), img)
        
        new_img.save(output_path)
        print(f"Successfully created padded image at {output_path}")
        
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    input_file = "assets/logo wihtout background.png"
    output_file = "assets/logo_padded.png"
    
    if os.path.exists(input_file):
        add_padding(input_file, output_file, padding_percent=0.35) # 35% padding on each side
    else:
        print(f"Input file not found: {input_file}")
