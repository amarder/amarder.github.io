#!/usr/bin/env python3
"""
Script to merge NPR book data with Amazon book data.
Matches books by ISBN/ASIN and combines data into a unified CSV format.
"""

import csv
import json
import sys
from typing import Dict, List, Optional


def load_npr_data(filepath: str) -> Dict[str, dict]:
    """Load NPR data and create a lookup by ISBN."""
    with open(filepath, 'r') as f:
        npr_data = json.load(f)
    
    # Flatten the data by year and create ISBN lookup
    isbn_lookup = {}
    for year, books in npr_data.items():
        for book in books:
            isbn = book.get('cover')
            if isbn:
                # Add year to the book data
                book_with_year = book.copy()
                book_with_year['year'] = year
                isbn_lookup[isbn] = book_with_year
    
    return isbn_lookup


def load_amazon_data(filepath: str) -> Dict[str, dict]:
    """Load Amazon JSONL data and create a lookup by ASIN."""
    asin_lookup = {}
    
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                amazon_book = json.loads(line)
                asin = amazon_book.get('ASIN')
                if asin:
                    asin_lookup[asin] = amazon_book
                
                # Also index by _isbn if available
                isbn = amazon_book.get('_isbn')
                if isbn and isbn != asin:
                    asin_lookup[isbn] = amazon_book
    
    return asin_lookup


def extract_amazon_data(amazon_book: dict) -> dict:
    """Extract relevant data from Amazon book record."""
    result = {}
    
    # Sales rank
    try:
        result['SalesRank'] = amazon_book['BrowseNodeInfo']['WebsiteSalesRank']['SalesRank']
    except (KeyError, TypeError):
        result['SalesRank'] = None
    
    # Number of pages
    try:
        result['pages'] = amazon_book['ItemInfo']['ContentInfo']['PagesCount']['DisplayValue']
    except (KeyError, TypeError):
        result['pages'] = None
    
    # ASIN
    result['ASIN'] = amazon_book.get('ASIN')
    
    return result


def merge_book_data(npr_file: str, amazon_file: str) -> List[dict]:
    """Merge NPR and Amazon book data."""
    print(f"Loading NPR data from {npr_file}...")
    npr_lookup = load_npr_data(npr_file)
    print(f"Loaded {len(npr_lookup)} NPR books")
    
    print(f"Loading Amazon data from {amazon_file}...")
    amazon_lookup = load_amazon_data(amazon_file)
    print(f"Loaded {len(amazon_lookup)} Amazon books")
    
    merged_books = []
    matched_count = 0
    
    for isbn, npr_book in npr_lookup.items():
        # Try to find matching Amazon data
        amazon_book = amazon_lookup.get(isbn)
        
        if amazon_book:
            amazon_data = extract_amazon_data(amazon_book)
            matched_count += 1
            
            # Create merged record
            merged_book = {
                'title': npr_book.get('title', ''),
                'author': npr_book.get('author', ''),
                'pages': amazon_data.get('pages', ''),
                'SalesRank': amazon_data.get('SalesRank', ''),
                'ASIN': amazon_data.get('ASIN', ''),
                'tags': ';'.join(npr_book.get('tags', [])),  # Join tags with semicolon
                'year': npr_book.get('year', '')
            }
        else:
            # NPR book without Amazon data
            merged_book = {
                'title': npr_book.get('title', ''),
                'author': npr_book.get('author', ''),
                'pages': '',
                'SalesRank': '',
                'ASIN': isbn,  # Use the ISBN as ASIN since it's likely the same
                'tags': ';'.join(npr_book.get('tags', [])),  # Join tags with semicolon
                'year': npr_book.get('year', '')
            }
        
        merged_books.append(merged_book)
    
    print(f"Merged {len(merged_books)} books total")
    print(f"Found Amazon data for {matched_count} books ({matched_count/len(merged_books)*100:.1f}%)")
    
    return merged_books


def save_to_csv(merged_books: List[dict], output_file: str):
    """Save merged books to CSV file."""
    fieldnames = ['title', 'author', 'pages', 'SalesRank', 'ASIN', 'tags', 'year']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(merged_books)


def main():
    """Main function."""
    if len(sys.argv) != 4:
        print("Usage: python merge_book_data.py <npr_file> <amazon_file> <output_file>")
        print("Example: python merge_book_data.py npr-all-years.json amazon_books.jsonl merged_books.csv")
        sys.exit(1)
    
    npr_file = sys.argv[1]
    amazon_file = sys.argv[2]
    output_file = sys.argv[3]
    
    try:
        merged_books = merge_book_data(npr_file, amazon_file)
        
        # Sort by year and title
        merged_books.sort(key=lambda x: (x['year'], x['title']))
        
        # Save merged data to CSV
        save_to_csv(merged_books, output_file)
        
        print(f"Merged data saved to {output_file}")
        
        # Print some sample records
        print("\nSample merged records:")
        for i, book in enumerate(merged_books[:3]):
            print(f"\n{i+1}. {book['title']} by {book['author']} ({book['year']})")
            print(f"   Pages: {book['pages']}, Sales Rank: {book['SalesRank']}")
            print(f"   ASIN: {book['ASIN']}")
            print(f"   Tags: {book['tags'] if book['tags'] else 'None'}")
    
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 