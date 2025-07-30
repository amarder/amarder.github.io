#!/usr/bin/env python3
"""
Amazon Product API search script for ISBN lookup using requests directly.
Requires API keys in .env file and standard libraries.

Install dependencies:
pip install requests python-dotenv boto3

Required .env variables:
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
AMAZON_REGION=us-east-1
"""

import os
import json
import hashlib
import hmac
import urllib.parse
from datetime import datetime, timezone
from dotenv import load_dotenv
import requests


def load_amazon_config():
    """Load Amazon API configuration from .env file."""
    load_dotenv()
    
    config = {
        'access_key': os.getenv('AMAZON_ACCESS_KEY'),
        'secret_key': os.getenv('AMAZON_SECRET_KEY'),
        'partner_tag': os.getenv('AMAZON_PARTNER_TAG'),
        'region': os.getenv('AMAZON_REGION', 'us-east-1')
    }
    
    # Set host based on region
    if config['region'] == 'us-east-1':
        config['host'] = 'webservices.amazon.com'
    elif config['region'] == 'eu-west-1':
        config['host'] = 'webservices.amazon.co.uk'
    else:
        config['host'] = f"webservices.amazon.{config['region']}"
    
    # Validate required keys
    missing_keys = [k for k, v in config.items() if not v and k != 'host']
    if missing_keys:
        raise ValueError(f"Missing required environment variables: {missing_keys}")
    
    return config


def sign_request(method, url, headers, payload, config):
    """Create AWS4 signature for the request."""
    
    # Parse the URL
    parsed_url = urllib.parse.urlparse(url)
    host = parsed_url.netloc
    path = parsed_url.path
    query = parsed_url.query
    
    # Create timestamp
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    datestamp = timestamp[:8]
    
    # Add required headers
    headers['Host'] = host
    headers['X-Amz-Date'] = timestamp
    
    # Create canonical request
    canonical_headers = []
    signed_headers = []
    
    for key in sorted(headers.keys()):
        canonical_headers.append(f"{key.lower()}:{headers[key].strip()}")
        signed_headers.append(key.lower())
    
    canonical_headers_str = '\n'.join(canonical_headers) + '\n'
    signed_headers_str = ';'.join(signed_headers)
    
    # Hash the payload
    payload_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
    
    canonical_request = f"{method}\n{path}\n{query}\n{canonical_headers_str}\n{signed_headers_str}\n{payload_hash}"
    
    # Create string to sign
    algorithm = 'AWS4-HMAC-SHA256'
    credential_scope = f"{datestamp}/{config['region']}/ProductAdvertisingAPI/aws4_request"
    string_to_sign = f"{algorithm}\n{timestamp}\n{credential_scope}\n{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"
    
    # Calculate signature
    def sign(key, msg):
        return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()
    
    def get_signature_key(key, datestamp, region, service):
        k_date = sign(('AWS4' + key).encode('utf-8'), datestamp)
        k_region = sign(k_date, region)
        k_service = sign(k_region, service)
        k_signing = sign(k_service, 'aws4_request')
        return k_signing
    
    signing_key = get_signature_key(config['secret_key'], datestamp, config['region'], 'ProductAdvertisingAPI')
    signature = hmac.new(signing_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    
    # Add authorization header
    authorization = f"{algorithm} Credential={config['access_key']}/{credential_scope}, SignedHeaders={signed_headers_str}, Signature={signature}"
    headers['Authorization'] = authorization
    
    return headers


def search_isbn(isbn, config):
    """Search Amazon Product API for the given ISBN using direct requests."""
    
    # API endpoint
    url = f"https://{config['host']}/paapi5/getitems"
    
    # Request payload - using minimal resources to ensure compatibility
    payload = {
        "ItemIds": [isbn],
        "Resources": [
            "ItemInfo.Title",
            "ItemInfo.ContentInfo",
            "BrowseNodeInfo.WebsiteSalesRank",
        ],
        "PartnerTag": config['partner_tag'],
        "PartnerType": "Associates",
        "Marketplace": "www.amazon.com"
    }
    
    payload_json = json.dumps(payload)
    
    # Headers
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Encoding': 'amz-1.0',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
    }
    
    # Sign the request
    headers = sign_request('POST', url, headers, payload_json, config)
    
    # Debug output
    print("\n" + "="*60)
    print("🔍 DEBUG: REQUEST DETAILS")
    print("="*60)
    print(f"URL: {url}")
    print(f"\nHeaders:")
    for key, value in headers.items():
        # Don't print the full authorization header for security, just show it exists
        if key == 'Authorization':
            print(f"  {key}: {value[:50]}...")
        else:
            print(f"  {key}: {value}")
    print(f"\nPayload:")
    print(json.dumps(json.loads(payload_json), indent=2))
    print("="*60)
    
    try:
        # Make the API call
        response = requests.post(url, headers=headers, data=payload_json, timeout=30)
        
        # Debug output for response
        print(f"\n🔍 DEBUG: RESPONSE DETAILS")
        print("="*60)
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        print(f"\nResponse Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
        print("="*60)
        
        if response.status_code == 200:
            data = response.json()
            if 'ItemsResult' in data and 'Items' in data['ItemsResult']:
                return data['ItemsResult']['Items'][0]
            else:
                print(f"No items found for ISBN: {isbn}")
                if 'Errors' in data:
                    for error in data['Errors']:
                        print(f"Error: {error.get('Code', 'Unknown')} - {error.get('Message', 'Unknown error')}")
                return None
        else:
            print(f"API request failed with status code: {response.status_code}")
            
            if response.status_code == 429:
                print("\n🚨 RATE LIMITING ERROR (429):")
                print("Amazon is throttling your requests. This could mean:")
                print("1. You're making requests too frequently (try adding delays)")
                print("2. Your API credentials aren't properly approved for PA-API")
                print("3. You need to apply for Product Advertising API access")
                print("\nNote: Amazon requires that you:")
                print("- Have an active Amazon Associates account")
                print("- Generate qualifying sales within 180 days")
                print("- Be approved specifically for PA-API access")
                
            elif response.status_code == 403:
                print("\n🚨 FORBIDDEN ERROR (403):")
                print("Check your API credentials and PA-API access permissions")
                
            return None
            
    except requests.RequestException as e:
        print(f"Error making request to Amazon Product API: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing API response: {e}")
        return None


def format_product_info(item):
    """Format and display product information."""
    if not item:
        return
    
    print("=" * 50)
    print("PRODUCT INFORMATION")
    print("=" * 50)
    
    # Title
    if 'ItemInfo' in item and 'Title' in item['ItemInfo']:
        print(f"Title: {item['ItemInfo']['Title']['DisplayValue']}")
    
    # Authors
    if 'ItemInfo' in item and 'ByLineInfo' in item['ItemInfo']:
        by_line = item['ItemInfo']['ByLineInfo']
        if 'Contributors' in by_line:
            authors = [contrib['Name'] for contrib in by_line['Contributors'] if 'Name' in contrib]
            if authors:
                print(f"Author(s): {', '.join(authors)}")
    
    # Publication details
    if 'ItemInfo' in item and 'ContentInfo' in item['ItemInfo']:
        content = item['ItemInfo']['ContentInfo']
        if 'PublicationDate' in content:
            print(f"Publication Date: {content['PublicationDate']['DisplayValue']}")
        if 'PagesCount' in content:
            print(f"Pages: {content['PagesCount']['DisplayValue']}")
    
    # Sales Rank from Classifications
    if 'ItemInfo' in item and 'Classifications' in item['ItemInfo']:
        classifications = item['ItemInfo']['Classifications']
        if 'ProductGroup' in classifications:
            print(f"Product Group: {classifications['ProductGroup']['DisplayValue']}")
        if 'Binding' in classifications:
            print(f"Binding: {classifications['Binding']['DisplayValue']}")
    
    # Sales Rank - Check multiple potential locations
    books_rank = None
    
    # Check for WebsiteSalesRank (overall Amazon rank)
    if 'BrowseNodeInfo' in item and 'WebsiteSalesRank' in item['BrowseNodeInfo']:
        website_rank = item['BrowseNodeInfo']['WebsiteSalesRank']
        if 'SalesRank' in website_rank:
            books_rank = website_rank['SalesRank']
            category = website_rank.get('ContextFreeName', 'Amazon Overall')
            print(f"📚 Amazon Sales Rank: #{books_rank:,} in {category}")
    
    # Check for sales rank in browse nodes
    if not books_rank and 'BrowseNodeInfo' in item and 'BrowseNodes' in item['BrowseNodeInfo']:
        for browse_node in item['BrowseNodeInfo']['BrowseNodes']:
            if 'SalesRank' in browse_node:
                category_name = browse_node.get('DisplayName', '').lower()
                # Look for the main Books category or Literature & Fiction
                if ('books' in category_name or 'literature' in category_name) and not books_rank:
                    books_rank = browse_node['SalesRank']
                    print(f"📚 Sales Rank: #{books_rank:,} in {browse_node.get('DisplayName', 'Books')}")
                    break
    
    # If still no rank found, show debug info
    if not books_rank:
        print("\n🔍 Sales Rank Debug Info:")
        
        # Check what's in BrowseNodeInfo
        if 'BrowseNodeInfo' in item:
            browse_info = item['BrowseNodeInfo']
            print(f"BrowseNodeInfo keys: {list(browse_info.keys())}")
            
            if 'WebsiteSalesRank' in browse_info:
                print(f"WebsiteSalesRank: {browse_info['WebsiteSalesRank']}")
            
            if 'BrowseNodes' in browse_info:
                print("BrowseNodes with sales rank data:")
                for i, node in enumerate(browse_info['BrowseNodes']):
                    if 'SalesRank' in node:
                        print(f"  Node {i}: {node}")
                    else:
                        print(f"  Node {i} ({node.get('DisplayName', 'Unknown')}): No SalesRank field")
        else:
            print("No BrowseNodeInfo found in response")
        
        print("\n💡 Possible reasons:")
        print("  - Sales rank data not available for this product")
        print("  - Your API access level doesn't include sales rank")
        print("  - Amazon has restricted sales rank data in PA-API")
    
    # Product URL
    asin = item.get('ASIN', 'Unknown')
    print(f"ASIN: {asin}")
    print(f"Amazon URL: https://www.amazon.com/dp/{asin}")
    
    # Image
    if 'Images' in item and 'Primary' in item['Images'] and 'Large' in item['Images']['Primary']:
        print(f"Image URL: {item['Images']['Primary']['Large']['URL']}")
    
    # Print raw item data for debugging what's available
    print("\n" + "=" * 50)
    print("RAW API RESPONSE (for debugging)")
    print("=" * 50)
    print(json.dumps(item, indent=2))


def main():
    """Main function to search for the specified ISBN."""
    isbn = "0770436404"
    
    try:
        # Load configuration
        config = load_amazon_config()
        print(f"Searching Amazon for ISBN: {isbn}")
        
        # Search for the product
        item = search_isbn(isbn, config)
        
        # Display results
        format_product_info(item)
        
    except ValueError as e:
        print(f"Configuration error: {e}")
        print("\nPlease create a .env file with the following variables:")
        print("AMAZON_ACCESS_KEY=your_access_key")
        print("AMAZON_SECRET_KEY=your_secret_key") 
        print("AMAZON_PARTNER_TAG=your_partner_tag")
        print("AMAZON_REGION=us-east-1")
        
    except Exception as e:
        print(f"Unexpected error: {e}")


if __name__ == "__main__":
    main()
