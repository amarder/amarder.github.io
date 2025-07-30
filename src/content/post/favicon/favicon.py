#!/usr/bin/env python3
"""
Favicon Generator from Portrait Photos

This script takes a portrait photo, detects the face, crops it to a square
centered on the face, and creates a high-quality 16x16 favicon.
"""

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import os
import sys
from pathlib import Path
from typing import Optional, List
import typer


def detect_face(image_path):
    """
    Detect face in the image and return the bounding box coordinates.
    
    Args:
        image_path (str): Path to the input image
        
    Returns:
        tuple: (x, y, width, height) of the detected face, or None if no face found
    """
    # Load the image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image: {image_path}")
    
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Load the face cascade classifier
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE
    )
    
    if len(faces) == 0:
        print("No faces detected in the image")
        return None
    
    # If multiple faces, choose the largest one
    if len(faces) > 1:
        print(f"Found {len(faces)} faces, using the largest one")
        faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
    
    return faces[0]


def crop_square_around_face(image_path, face_coords, padding_factor=1.5):
    """
    Crop the image to a square centered on the detected face.
    
    Args:
        image_path (str): Path to the input image
        face_coords (tuple): (x, y, width, height) of the detected face
        padding_factor (float): How much extra space around the face to include
        
    Returns:
        PIL.Image: Cropped square image
    """
    # Open with PIL for better image handling
    img = Image.open(image_path)
    img_width, img_height = img.size
    
    x, y, w, h = face_coords
    
    # Calculate the center of the face
    face_center_x = x + w // 2
    face_center_y = y + h // 2
    
    # Calculate the size of the square crop
    # Use the larger dimension of the face and apply padding
    face_size = max(w, h)
    crop_size = int(face_size * padding_factor)
    
    # Calculate crop boundaries
    half_crop = crop_size // 2
    left = max(0, face_center_x - half_crop)
    top = max(0, face_center_y - half_crop)
    right = min(img_width, face_center_x + half_crop)
    bottom = min(img_height, face_center_y + half_crop)
    
    # Adjust to make it actually square
    crop_width = right - left
    crop_height = bottom - top
    final_size = min(crop_width, crop_height)
    
    # Re-center the crop
    center_x = left + crop_width // 2
    center_y = top + crop_height // 2
    half_final = final_size // 2
    
    left = center_x - half_final
    top = center_y - half_final
    right = left + final_size
    bottom = top + final_size
    
    # Crop the image
    cropped = img.crop((left, top, right, bottom))
    
    return cropped


def create_smart_favicon(cropped_img, size=16, num_colors=8):
    """
    Create a high-quality favicon from the cropped square image using color quantization.
    
    Args:
        cropped_img (PIL.Image): Square cropped image
        size (int): Output size in pixels (e.g., 16 for 16x16)
        num_colors (int): Number of colors to use in the final palette
        
    Returns:
        PIL.Image: Favicon at specified size
    """
    # First, resize to a larger intermediate size for better quality
    # This helps preserve important features before final downscaling
    # Use at least 64px or 4x the target size, whichever is larger
    intermediate_size = max(64, size * 4)
    intermediate = cropped_img.resize((intermediate_size, intermediate_size), Image.LANCZOS)
    
    # Convert to RGB if not already
    if intermediate.mode != 'RGB':
        intermediate = intermediate.convert('RGB')
    
    # Apply ALL enhancements BEFORE quantization to avoid creating new colors
    # Enhance contrast significantly for better definition at small sizes
    enhancer = ImageEnhance.Contrast(intermediate)
    intermediate = enhancer.enhance(1.4)
    
    # Increase sharpness for edge definition
    enhancer = ImageEnhance.Sharpness(intermediate)
    intermediate = enhancer.enhance(1.5)
    
    # Apply edge enhancement to improve definition
    intermediate = intermediate.filter(ImageFilter.EDGE_ENHANCE)
    
    # Apply color quantization to reduce to specified number of colors
    # This creates a posterized effect that's much clearer at small sizes
    quantized = intermediate.quantize(colors=num_colors, method=Image.Quantize.MEDIANCUT)
    
    # Convert back to RGB but preserve exact color palette
    quantized = quantized.convert('RGB')
    
    # Final resize to target size using NEAREST to preserve exact colors
    # NEAREST neighbor ensures no new colors are introduced
    favicon = quantized.resize((size, size), Image.NEAREST)
    
    return favicon


def count_unique_colors(img):
    """
    Count the number of unique colors in an image.
    
    Args:
        img (PIL.Image): Image to analyze
        
    Returns:
        int: Number of unique colors
    """
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Get all pixel values
    pixels = list(img.getdata())
    
    # Count unique colors
    unique_colors = set(pixels)
    
    return len(unique_colors)


def generate_favicon(input_path, output_path=None, padding_factor=1.5, num_colors=8, size=16):
    """
    Complete pipeline to generate a favicon from a portrait photo.
    
    Args:
        input_path (str): Path to input image
        output_path (str): Path for output favicon (optional)
        padding_factor (float): How much space around face to include
        num_colors (int): Number of colors to use in the final palette
        size (int): Output size in pixels (e.g., 16 for 16x16)
        
    Returns:
        str: Path to the generated favicon
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input image not found: {input_path}")
    
    # Detect face
    print(f"Detecting face in {input_path}...")
    face_coords = detect_face(input_path)
    
    if face_coords is None:
        raise ValueError("No face detected in the image")
    
    x, y, w, h = face_coords
    print(f"Face detected at position ({x}, {y}) with size {w}x{h}")
    
    # Crop to square
    print("Cropping image to square around face...")
    cropped = crop_square_around_face(input_path, face_coords, padding_factor)
    
    # Create favicon at specified size
    print(f"Creating {size}x{size} favicon with {num_colors} colors...")
    favicon = create_smart_favicon(cropped, size, num_colors)
    
    # Save the favicon
    if output_path is None:
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = f"{base_name}_favicon_{size}x{size}.png"
    
    favicon.save(output_path, "PNG")
    print(f"Favicon saved to: {output_path}")
    
    # Also save the cropped square version for reference
    cropped_path = output_path.replace('.png', '_cropped.png')
    cropped.save(cropped_path, "PNG")
    print(f"Cropped square image saved to: {cropped_path}")
    
    return output_path


def generate_favicon_variants(input_path, base_output_path=None, padding_factor=1.5, color_counts=[4, 6, 8, 12, 16], size=16):
    """
    Generate multiple favicon variants with different color counts for comparison.
    
    Args:
        input_path (str): Path to input image
        base_output_path (str): Base output path (optional)
        padding_factor (float): How much space around face to include
        color_counts (list): List of color counts to generate
        size (int): Output size in pixels (e.g., 16 for 16x16)
        
    Returns:
        list: Paths to generated favicons
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input image not found: {input_path}")
    
    # Detect face once
    print(f"Detecting face in {input_path}...")
    face_coords = detect_face(input_path)
    
    if face_coords is None:
        raise ValueError("No face detected in the image")
    
    x, y, w, h = face_coords
    print(f"Face detected at position ({x}, {y}) with size {w}x{h}")
    
    # Crop to square once
    print("Cropping image to square around face...")
    cropped = crop_square_around_face(input_path, face_coords, padding_factor)
    
    # Generate variants
    results = []
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    
    for num_colors in color_counts:
        print(f"Creating {size}x{size} favicon with {num_colors} colors...")
        favicon = create_smart_favicon(cropped, size, num_colors)
        
        if base_output_path:
            output_path = base_output_path.replace('.png', f'_{size}x{size}_{num_colors}colors.png')
        else:
            output_path = f"{base_name}_favicon_{size}x{size}_{num_colors}colors.png"
        
        favicon.save(output_path, "PNG")
        
        # Check actual color count
        actual_colors = count_unique_colors(favicon)
        results.append(output_path)
        print(f"  Saved: {output_path} (requested: {num_colors}, actual: {actual_colors})")
    
    # Save the cropped version for reference
    cropped_path = f"{base_name}_cropped.png"
    cropped.save(cropped_path, "PNG")
    print(f"Cropped square image saved to: {cropped_path}")
    
    return results


# Create the typer app
app = typer.Typer(
    name="favicon-generator",
    help="Generate crisp favicons from portrait photos using face detection and color quantization. Supports custom sizes from 8x8 to 512x512.",
    epilog="💡 Tip: Try the 'variants' command to compare different color counts!",
)


@app.command()
def generate(
    input_image: Path = typer.Argument(..., help="Path to the input portrait photo"),
    output_path: Optional[Path] = typer.Option(
        None, 
        "--output", "-o", 
        help="Output filename (defaults to input_name_favicon_SIZExSIZE.png)"
    ),
    size: int = typer.Option(
        16,
        "--size", "-s",
        min=8,
        max=512,
        help="Output size in pixels (e.g., 16 for 16x16, 32 for 32x32)"
    ),
    padding_factor: float = typer.Option(
        1.5, 
        "--padding", "-p", 
        min=1.0, 
        max=3.0,
        help="Space around face (1.2=tight, 1.5=balanced, 2.0=loose)"
    ),
    num_colors: int = typer.Option(
        8, 
        "--colors", "-c", 
        min=2, 
        max=32,
        help="Colors in palette (4=simple, 8=balanced, 16=detailed)"
    ),
):
    """
    Generate a single favicon from a portrait photo.
    
    This command detects faces, crops to a square, and creates a crisp favicon
    at the specified size using color quantization for maximum legibility.
    """
    try:
        result_path = generate_favicon(
            str(input_image), 
            str(output_path) if output_path else None, 
            padding_factor, 
            num_colors,
            size
        )
        
        print(f"\n✅ Success! Favicon generated: {result_path}")
        
        # Display some info about the result
        favicon = Image.open(result_path)
        actual_colors = count_unique_colors(favicon)
        print(f"📏 Final favicon size: {favicon.size}")
        print(f"🎨 Colors requested: {num_colors}")
        print(f"🎨 Colors actually used: {actual_colors}")
        print(f"📁 Image mode: {favicon.mode}")
        
        if actual_colors <= num_colors:
            print(f"✅ Color quantization successful!")
        else:
            print(f"⚠️  Warning: Image has more colors than requested")
        
        print(f"\n💡 Tip: Try 'python favicon.py variants {input_image} --size {size}' to compare different color counts!")
        
    except Exception as e:
        typer.echo(f"❌ Error: {e}", err=True)
        raise typer.Exit(1)


@app.command()
def variants(
    input_image: Path = typer.Argument(..., help="Path to the input portrait photo"),
    size: int = typer.Option(
        16,
        "--size", "-s",
        min=8,
        max=512,
        help="Output size in pixels (e.g., 16 for 16x16, 32 for 32x32)"
    ),
    padding_factor: float = typer.Option(
        1.5, 
        "--padding", "-p", 
        min=1.0, 
        max=3.0,
        help="Space around face (1.2=tight, 1.5=balanced, 2.0=loose)"
    ),
    color_counts: Optional[str] = typer.Option(
        "4,6,8,12,16",
        "--colors", "-c",
        help="Comma-separated color counts to generate (e.g., '4,8,16')"
    ),
):
    """
    Generate multiple favicon variants with different color counts for comparison.
    
    This is useful for finding the optimal color count for your specific image at the chosen size.
    Creates separate files for each color count so you can compare them side by side.
    """
    try:
        # Parse color counts
        color_list = [int(c.strip()) for c in color_counts.split(',')]
        
        result_paths = generate_favicon_variants(
            str(input_image), 
            padding_factor=padding_factor,
            color_counts=color_list,
            size=size
        )
        
        print(f"\n✅ Success! Generated {len(result_paths)} favicon variants:")
        for path in result_paths:
            print(f"  📄 {path}")
        
        print("\n🔍 Compare these files to find the best color count for your image!")
        print("📋 Color count recommendations:")
        print("   • 4 colors: Very simple, pixel art style")
        print("   • 6-8 colors: Good balance of simplicity and detail")
        print("   • 12-16 colors: More detailed but may look busier at 16x16")
        
    except Exception as e:
        typer.echo(f"❌ Error: {e}", err=True)
        raise typer.Exit(1)


@app.command()
def info():
    """
    Display information about the favicon generator and usage tips.
    """
    typer.echo("🖼️  Favicon Generator")
    typer.echo("=" * 50)
    typer.echo("This tool creates crisp favicons from portrait photos using:")
    typer.echo("• Face detection with OpenCV")
    typer.echo("• Smart square cropping centered on the face")
    typer.echo("• Color quantization for clarity at small sizes")
    typer.echo("• Configurable output sizes (8x8 to 512x512)")
    typer.echo("")
    typer.echo("📋 Quick Start:")
    typer.echo("  python favicon.py generate photo.jpg")
    typer.echo("  python favicon.py generate photo.jpg --size 32")
    typer.echo("  python favicon.py variants photo.jpg --size 16")
    typer.echo("")
    typer.echo("📏 Size Guidelines:")
    typer.echo("  • 16x16: Traditional favicon size")
    typer.echo("  • 32x32: High-DPI favicon")
    typer.echo("  • 48x48: Windows taskbar icon")
    typer.echo("  • 64x64 or larger: Profile pictures, avatars")
    typer.echo("")
    typer.echo("🎨 Color Count Guidelines:")
    typer.echo("  • 4 colors: Minimal, high contrast (good for silhouettes)")
    typer.echo("  • 6-8 colors: Balanced detail and simplicity (recommended)")
    typer.echo("  • 12-16 colors: Maximum detail (may look busy at small sizes)")
    typer.echo("")
    typer.echo("📏 Padding Guidelines:")
    typer.echo("  • 1.2: Tight crop, face fills most of the square")
    typer.echo("  • 1.5: Balanced (default)")
    typer.echo("  • 2.0: Loose crop, more background around face")


if __name__ == "__main__":
    app()
