from PIL import Image
import numpy as np
import subprocess

def quantize_grayscale(image_array, levels=[0, 0.25, 0.5, 0.75, 1]):
    """Quantize grayscale values to specific levels"""
    # Convert to 0-1 range
    normalized = image_array / 255.0
    
    # Find closest level for each pixel
    quantized = np.zeros_like(normalized)
    for i, level in enumerate(levels):
        if i == 0:
            mask = normalized <= (levels[0] + levels[1]) / 2
        elif i == len(levels) - 1:
            mask = normalized > (levels[i-1] + levels[i]) / 2
        else:
            mask = (normalized > (levels[i-1] + levels[i]) / 2) & (normalized <= (levels[i] + levels[i+1]) / 2)
        quantized[mask] = level
    
    return (quantized * 255).astype(np.uint8)

def create_hatching_svg(quantized_array, pixel_size=10, output_file='profile_hatched.svg'):
    """Create SVG with hatching patterns based on quantized grayscale values"""
    height, width = quantized_array.shape
    svg_width = width * pixel_size
    svg_height = height * pixel_size
    
    # Convert back to 0-1 range for comparison
    normalized = quantized_array / 255.0
    
    svg_lines = []
    line_spacing = pixel_size / 2  # 1 lines per pixel
    stroke_width = 0.5
    
    for y in range(height):
        for x in range(width):
            pixel_value = normalized[y, x]
            
            # Calculate pixel boundaries in SVG coordinates
            x_start = x * pixel_size
            y_start = y * pixel_size
            x_end = x_start + pixel_size
            y_end = y_start + pixel_size
            
            # Generate line positions within the pixel
            line_positions = [i * line_spacing + line_spacing/2 for i in range(4)]
            
            if abs(pixel_value - 1.0) < 0.01:  # 1.0 - white, nothing shown
                continue
            elif abs(pixel_value - 0.75) < 0.01:  # 0.75 - light gray, diagonal (lower left to upper right) only
                # Diagonal lines (lower left to upper right)
                for i in range(4):
                    offset = (i - 1.5) * line_spacing
                    svg_lines.append(f'<line x1="{x_start}" y1="{y_end + offset}" x2="{x_end}" y2="{y_start + offset}" stroke="black" stroke-width="{stroke_width}"/>')
            elif abs(pixel_value - 0.5) < 0.01:  # 0.5 - medium gray, both diagonal lines
                # Diagonal lines (lower left to upper right)
                for i in range(4):
                    offset = (i - 1.5) * line_spacing
                    svg_lines.append(f'<line x1="{x_start}" y1="{y_end + offset}" x2="{x_end}" y2="{y_start + offset}" stroke="black" stroke-width="{stroke_width}"/>')
                # Diagonal lines (upper left to lower right)
                for i in range(4):
                    offset = (i - 1.5) * line_spacing
                    svg_lines.append(f'<line x1="{x_start}" y1="{y_start + offset}" x2="{x_end}" y2="{y_end + offset}" stroke="black" stroke-width="{stroke_width}"/>')
            elif abs(pixel_value - 0.25) < 0.01:  # 0.25 - dark gray, both diagonals + vertical
                # Diagonal lines (lower left to upper right)
                for i in range(4):
                    offset = (i - 1.5) * line_spacing
                    svg_lines.append(f'<line x1="{x_start}" y1="{y_end + offset}" x2="{x_end}" y2="{y_start + offset}" stroke="black" stroke-width="{stroke_width}"/>')
                # Diagonal lines (upper left to lower right)
                for i in range(4):
                    offset = (i - 1.5) * line_spacing
                    svg_lines.append(f'<line x1="{x_start}" y1="{y_start + offset}" x2="{x_end}" y2="{y_end + offset}" stroke="black" stroke-width="{stroke_width}"/>')
                # Vertical lines
                for line_x in line_positions:
                    svg_lines.append(f'<line x1="{x_start + line_x}" y1="{y_start}" x2="{x_start + line_x}" y2="{y_end}" stroke="black" stroke-width="{stroke_width}"/>')
            elif pixel_value <= 0.01:  # 0.0 - black, all four line directions
                # Diagonal lines (lower left to upper right)
                for i in range(4):
                    offset = (i - 1.5) * line_spacing
                    svg_lines.append(f'<line x1="{x_start}" y1="{y_end + offset}" x2="{x_end}" y2="{y_start + offset}" stroke="black" stroke-width="{stroke_width}"/>')
                # Diagonal lines (upper left to lower right)
                for i in range(4):
                    offset = (i - 1.5) * line_spacing
                    svg_lines.append(f'<line x1="{x_start}" y1="{y_start + offset}" x2="{x_end}" y2="{y_end + offset}" stroke="black" stroke-width="{stroke_width}"/>')
                # Vertical lines
                for line_x in line_positions:
                    svg_lines.append(f'<line x1="{x_start + line_x}" y1="{y_start}" x2="{x_start + line_x}" y2="{y_end}" stroke="black" stroke-width="{stroke_width}"/>')
                # Horizontal lines
                for line_y in line_positions:
                    svg_lines.append(f'<line x1="{x_start}" y1="{y_start + line_y}" x2="{x_end}" y2="{y_start + line_y}" stroke="black" stroke-width="{stroke_width}"/>')
    
    # Create SVG content
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{svg_width}" height="{svg_height}" viewBox="0 0 {svg_width} {svg_height}">
<rect width="{svg_width}" height="{svg_height}" fill="white"/>
{chr(10).join(svg_lines)}
</svg>'''
    
    with open(output_file, 'w') as f:
        f.write(svg_content)
    
    print(f"SVG created: {output_file}")
    print(f"SVG dimensions: {svg_width}x{svg_height}")

# Read the image
image = Image.open('profile.jpg')

# Scale down to 64x64
image_resized = image.resize((64, 64), Image.Resampling.LANCZOS)

# Convert to grayscale
image_gray = image_resized.convert('L')

# Convert to numpy array for processing
image_array = np.array(image_gray)

# Quantize to the specified levels
quantized_array = quantize_grayscale(image_array)

# Convert back to PIL Image and save
result_image = Image.fromarray(quantized_array, mode='L')
result_image.save('profile_64x64_quantized.png')

print("Processed image saved as 'profile_64x64_quantized.png'")
print("Image size:", result_image.size)
print("Unique grayscale values:", sorted(set(quantized_array.flatten())))

# Create the hatching SVG
create_hatching_svg(quantized_array)

# Convert SVG to PNG using cairosvg
cmd = f'cairosvg --output-width 675 --output-height 675 profile_hatched.svg -o third.png'
print(f"Running: {cmd}")
subprocess.call(cmd, shell=True)
print("PNG created: profile_hatched.png")
