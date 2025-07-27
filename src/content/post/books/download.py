#!/usr/bin/env python3
"""
Download NPR Best Books JSON files for years 2013-2024.
Saves all years to a single file as a dict with year as key and list of books as value.
"""

import requests
import json
from pathlib import Path

def download_npr_books(year):
    """Download NPR best books JSON for a given year and return the data."""
    url = f"https://apps.npr.org/best-books/{year}.json"
    
    try:
        print(f"Downloading {year}...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Parse JSON to validate it
        data = response.json()
        print(f"✓ Downloaded {year} ({len(data)} books)")
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to download {year}: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"✗ Invalid JSON for {year}: {e}")
        return None
    except Exception as e:
        print(f"✗ Error downloading {year}: {e}")
        return None

def main():
    """Download NPR best books for years 2013-2024 and combine into one file."""
    print("Downloading NPR Best Books JSON files...")
    print("=" * 50)
    
    start_year = 2013
    end_year = 2024
    
    all_books = {}
    success_count = 0
    total_years = end_year - start_year + 1
    
    # Download data for each year
    for year in range(start_year, end_year + 1):
        year_str = str(year)
        data = download_npr_books(year)
        
        if data is not None:
            all_books[year_str] = data
            success_count += 1
    
    # Save consolidated file
    if all_books:
        books_dir = Path(__file__).parent.parent.parent.parent / "public" / "books"
        books_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = books_dir / "npr-all-years.json"
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(all_books, f, ensure_ascii=False, indent=2)
            
            print("=" * 50)
            print(f"✓ Saved consolidated file: {output_file}")
            print(f"Complete! Downloaded {success_count}/{total_years} years successfully.")
            
            # Print summary of what was saved
            total_books = sum(len(books) for books in all_books.values())
            print(f"Total books across all years: {total_books}")
            
        except Exception as e:
            print(f"✗ Error saving consolidated file: {e}")
    else:
        print("✗ No data was successfully downloaded.")

if __name__ == "__main__":
    main()