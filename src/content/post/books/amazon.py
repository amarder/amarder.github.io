#!/usr/bin/env python3
"""
Amazon Product API batch ISBN lookup script.
Downloads book data for multiple ISBNs and saves to JSON lines format.

Install dependencies:
pip install -r requirements.txt

Required .env variables:
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
AMAZON_REGION=us-east-1

API Rate Limits (Per Amazon PA-API 5.0 Documentation):
- Initial limits: 1 TPS (transaction per second), 8640 TPD (transactions per day)
- Limits increase based on shipped revenue: +1 TPD per $0.05, +1 TPS per $4320
- Account loses access if no sales for 30 consecutive days
- Always include Partner Tag and use primary account credentials

Usage examples:
# Check API compliance before running
python amazon.py check-limits 1000 --delay 1.5

# Check today's API usage
python amazon.py usage amazon_books.jsonl

# Test with a single ISBN
python amazon.py test 0770436404

# Test with debugger on rate limits
python amazon.py test 0770436404 --debug-rate-limits

# Download data for multiple ISBNs (respects rate limits)
python amazon.py download example_isbns.txt

# Download with debugger on rate limit errors
python amazon.py download isbns.txt --debug-rate-limits

# Download with custom output file and delay
python amazon.py download isbns.txt --output-file my_books.jsonl --delay 2.0

# Force re-download existing data
python amazon.py download isbns.txt --force

# Show summary of downloaded data
python amazon.py summary amazon_books.jsonl
"""

import os
import json
import hashlib
import hmac
import urllib.parse
import time
import pdb
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv
import requests
import typer
from tqdm import tqdm


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


def search_isbn(isbn, config, debug_rate_limits=False):
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
    
    try:
        # Make the API call
        response = requests.post(url, headers=headers, data=payload_json, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'ItemsResult' in data and 'Items' in data['ItemsResult']:
                item = data['ItemsResult']['Items'][0]
                # Add metadata
                item['_isbn'] = isbn
                item['_retrieved_at'] = datetime.now(timezone.utc).isoformat()
                return item
            else:
                # Return error info for debugging
                error_info = {
                    '_isbn': isbn,
                    '_retrieved_at': datetime.now(timezone.utc).isoformat(),
                    '_error': 'No items found',
                    '_api_errors': data.get('Errors', [])
                }
                return error_info
        else:
            # Return error info
            error_info = {
                '_isbn': isbn,
                '_retrieved_at': datetime.now(timezone.utc).isoformat(),
                '_error': f'API request failed with status {response.status_code}',
                '_status_code': response.status_code
            }
            
            # Add specific error handling for rate limiting
            if response.status_code == 429:
                # Try to determine which rate limit we hit
                retry_after = response.headers.get('Retry-After')
                x_amzn_errortype = response.headers.get('x-amzn-ErrorType', '')
                
                # Check if this might be a daily limit hit
                daily_limit_indicators = ['TooManyRequests', 'Throttling']
                is_likely_daily_limit = any(indicator in x_amzn_errortype for indicator in daily_limit_indicators)
                
                if retry_after:
                    error_info['_error'] = f'Rate limited - retry after {retry_after} seconds'
                    error_info['_retry_after'] = retry_after
                elif is_likely_daily_limit:
                    error_info['_error'] = 'Rate limited - likely daily limit (8640 TPD) exceeded'
                    error_info['_suggestion'] = 'Wait until tomorrow or check your daily usage'
                else:
                    error_info['_error'] = 'Rate limited - too many requests per second (1 TPS limit)'
                    error_info['_suggestion'] = 'Increase delay between requests'
                
                error_info['_rate_limit_headers'] = dict(response.headers)
                
                # Optional debug breakpoint to inspect rate limiting response
                if debug_rate_limits:
                    print(f"\n🚨 RATE LIMIT ERROR - Starting debugger for ISBN: {isbn}")
                    print("Available variables for inspection:")
                    print("- response: HTTP response object")
                    print("- response.status_code: HTTP status code")
                    print("- response.headers: Response headers")
                    print("- response.text: Raw response body")
                    print("- isbn: Current ISBN being processed")
                    print("- error_info: Error info being returned")
                    print("Type 'c' to continue, 'q' to quit debugger")
                    pdb.set_trace()  # Breakpoint for debugging
                
                # Smart backoff based on the type of rate limiting
                if retry_after:
                    # Amazon told us exactly when to retry
                    backoff_time = min(int(retry_after), 300)  # Max 5 minutes
                elif is_likely_daily_limit:
                    # If we hit daily limit, no point in short backoff
                    print(f"⏸️  Daily limit likely exceeded. Stopping to avoid wasting requests.")
                    return error_info  # Don't sleep, just return the error
                else:
                    # Likely TPS limit, use progressive backoff
                    backoff_time = min(60, delay * 2)  # Double the current delay, max 60s
                
                print(f"⏳ Rate limited. Waiting {backoff_time} seconds before continuing...")
                time.sleep(backoff_time)
                
            return error_info
            
    except requests.RequestException as e:
        return {
            '_isbn': isbn,
            '_retrieved_at': datetime.now(timezone.utc).isoformat(),
            '_error': f'Network error: {str(e)}'
        }
    except json.JSONDecodeError as e:
        return {
            '_isbn': isbn,
            '_retrieved_at': datetime.now(timezone.utc).isoformat(),
            '_error': f'JSON decode error: {str(e)}'
        }


def load_isbns_from_file(file_path: Path) -> List[str]:
    """Load ISBNs from a text file (one per line)."""
    if not file_path.exists():
        typer.echo(f"Error: ISBN file {file_path} not found", err=True)
        raise typer.Exit(1)
    
    isbns = []
    with open(file_path, 'r') as f:
        for line_num, line in enumerate(f, 1):
            isbn = line.strip()
            if isbn and not isbn.startswith('#'):  # Skip empty lines and comments
                isbns.append(isbn)
    
    if not isbns:
        typer.echo(f"Error: No ISBNs found in {file_path}", err=True)
        raise typer.Exit(1)
    
    return isbns


def load_existing_data(output_file: Path) -> Dict[str, Any]:
    """Load already downloaded ISBN data from JSON lines file."""
    existing_data = {}
    
    if output_file.exists():
        with open(output_file, 'r') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    item = json.loads(line.strip())
                    if '_isbn' in item:
                        existing_data[item['_isbn']] = item
                except json.JSONDecodeError as e:
                    typer.echo(f"Warning: Skipping invalid JSON on line {line_num}: {e}", err=True)
    
    return existing_data


def count_todays_requests(output_file: Path) -> int:
    """Count how many API requests we've made today."""
    if not output_file.exists():
        return 0
    
    today = datetime.now(timezone.utc).date()
    count = 0
    
    with open(output_file, 'r') as f:
        for line in f:
            try:
                item = json.loads(line.strip())
                if '_retrieved_at' in item:
                    retrieved_date = datetime.fromisoformat(item['_retrieved_at'].replace('Z', '+00:00')).date()
                    if retrieved_date == today:
                        count += 1
            except (json.JSONDecodeError, ValueError):
                continue
    
    return count


def save_item_to_file(item: Dict[str, Any], output_file: Path) -> None:
    """Append a single item to the JSON lines file."""
    with open(output_file, 'a') as f:
        f.write(json.dumps(item) + '\n')


def process_isbns(
    isbns: List[str], 
    output_file: Path, 
    config: Dict[str, str],
    delay: float = 1.0,
    skip_existing: bool = True,
    debug_rate_limits: bool = False
) -> None:
    """Process a list of ISBNs, downloading data from Amazon API."""
    
    # Load existing data if we're skipping already downloaded ISBNs
    existing_data = load_existing_data(output_file) if skip_existing else {}
    
    # Filter out ISBNs we already have
    isbns_to_process = [isbn for isbn in isbns if isbn not in existing_data]
    
    if skip_existing and existing_data:
        typer.echo(f"Found {len(existing_data)} existing records, processing {len(isbns_to_process)} new ISBNs")
    
    if not isbns_to_process:
        typer.echo("All ISBNs already downloaded!")
        return
    
    # Check daily rate limits (8640 TPD for new accounts)
    daily_limit = 8640  # Initial limit for new accounts
    todays_requests = count_todays_requests(output_file)
    remaining_today = daily_limit - todays_requests
    
    typer.echo(f"📊 Daily API usage: {todays_requests}/{daily_limit} requests used today")
    typer.echo(f"📊 Remaining today: {remaining_today} requests")
    
    if len(isbns_to_process) > remaining_today:
        typer.echo(f"❌ Cannot process {len(isbns_to_process)} ISBNs - only {remaining_today} requests remaining today")
        if remaining_today > 0:
            typer.echo(f"💡 You can process {remaining_today} ISBNs today, then continue tomorrow")
            if typer.confirm(f"Process first {remaining_today} ISBNs?"):
                isbns_to_process = isbns_to_process[:remaining_today]
            else:
                raise typer.Exit(0)
        else:
            typer.echo("💤 Daily limit reached. Try again tomorrow!")
            raise typer.Exit(0)
    
    # Process ISBNs with progress bar
    with tqdm(total=len(isbns_to_process), desc="Downloading book data") as pbar:
        for i, isbn in enumerate(isbns_to_process):
            # Update progress bar description
            pbar.set_description(f"Processing {isbn}")
            
            # Get data from Amazon
            item = search_isbn(isbn, config, debug_rate_limits)
            
            # Save to file
            save_item_to_file(item, output_file)
            
            # Update progress
            pbar.update(1)
            
            # Check if we hit daily limit and should stop
            if '_error' in item and 'daily limit' in item['_error'].lower():
                remaining_isbns = len(isbns_to_process) - i - 1
                pbar.set_postfix(status="Daily Limit Hit", remaining=remaining_isbns)
                typer.echo(f"\n🛑 Daily limit reached. Stopping processing.")
                typer.echo(f"📊 Processed: {i + 1}/{len(isbns_to_process)} ISBNs")
                typer.echo(f"📅 Continue tomorrow with remaining {remaining_isbns} ISBNs")
                break
            
            # Show result in progress bar
            if '_error' in item:
                pbar.set_postfix(status="Error", error=item['_error'][:30])
            else:
                title = ""
                if 'ItemInfo' in item and 'Title' in item['ItemInfo']:
                    title = item['ItemInfo']['Title']['DisplayValue'][:30]
                pbar.set_postfix(status="Success", title=title)
            
            # Rate limiting delay (skip if this is the last item)
            if delay > 0 and i < len(isbns_to_process) - 1:
                time.sleep(delay)


def print_summary(output_file: Path) -> None:
    """Print a summary of the downloaded data."""
    if not output_file.exists():
        typer.echo("No output file found")
        return
    
    total_count = 0
    success_count = 0
    error_count = 0
    
    with open(output_file, 'r') as f:
        for line in f:
            try:
                item = json.loads(line.strip())
                total_count += 1
                if '_error' in item:
                    error_count += 1
                else:
                    success_count += 1
            except json.JSONDecodeError:
                continue
    
    typer.echo(f"\n📊 Summary:")
    typer.echo(f"  Total records: {total_count}")
    typer.echo(f"  Successful: {success_count}")
    typer.echo(f"  Errors: {error_count}")
    typer.echo(f"  Output file: {output_file}")


app = typer.Typer(help="Amazon Product API batch ISBN lookup tool")


@app.command()
def download(
    isbn_file: Path = typer.Argument(..., help="Text file containing ISBNs (one per line)"),
    output_file: Path = typer.Option("amazon_books.jsonl", help="Output JSON lines file"),
    delay: float = typer.Option(1.0, help="Delay between requests in seconds (minimum 1.0 for API compliance)"),
    force: bool = typer.Option(False, "--force", help="Re-download existing ISBNs"),
    summary: bool = typer.Option(True, "--summary/--no-summary", help="Show summary after completion"),
    debug_rate_limits: bool = typer.Option(False, "--debug-rate-limits", help="Drop into debugger on rate limit errors")
):
    """Download book data for ISBNs from Amazon Product API."""
    
    try:
        # Validate delay parameter for API compliance
        if delay < 1.0:
            typer.echo("⚠️  Warning: Delay less than 1 second may violate API rate limits (1 TPS)", err=True)
            typer.echo("Setting delay to 1.0 seconds for compliance", err=True)
            delay = 1.0
        
        # Load configuration
        config = load_amazon_config()
        typer.echo("✅ Amazon API configuration loaded")
        
        # Load ISBNs
        isbns = load_isbns_from_file(isbn_file)
        typer.echo(f"📚 Loaded {len(isbns)} ISBNs from {isbn_file}")
        
        # Process ISBNs
        process_isbns(
            isbns=isbns,
            output_file=output_file,
            config=config,
            delay=delay,
            skip_existing=not force,
            debug_rate_limits=debug_rate_limits
        )
        
        # Show summary
        if summary:
            print_summary(output_file)
            
    except ValueError as e:
        typer.echo(f"❌ Configuration error: {e}", err=True)
        typer.echo("\nPlease create a .env file with the following variables:", err=True)
        typer.echo("AMAZON_ACCESS_KEY=your_access_key", err=True)
        typer.echo("AMAZON_SECRET_KEY=your_secret_key", err=True)
        typer.echo("AMAZON_PARTNER_TAG=your_partner_tag", err=True)
        typer.echo("AMAZON_REGION=us-east-1", err=True)
        raise typer.Exit(1)
        
    except Exception as e:
        typer.echo(f"❌ Unexpected error: {e}", err=True)
        raise typer.Exit(1)


@app.command()
def summary(
    output_file: Path = typer.Argument("amazon_books.jsonl", help="JSON lines file to summarize")
):
    """Show summary of downloaded data."""
    print_summary(output_file)


@app.command()
def usage(
    output_file: Path = typer.Argument("amazon_books.jsonl", help="JSON lines file to check")
):
    """Check today's API usage against daily limits."""
    daily_limit = 8640
    todays_requests = count_todays_requests(output_file)
    remaining_today = daily_limit - todays_requests
    
    typer.echo(f"📊 Today's API Usage Report")
    typer.echo(f"═══════════════════════════")
    typer.echo(f"🎯 Daily Limit: {daily_limit:,} requests")
    typer.echo(f"✅ Used Today: {todays_requests:,} requests")
    typer.echo(f"🔄 Remaining: {remaining_today:,} requests")
    typer.echo(f"📈 Usage: {(todays_requests/daily_limit)*100:.1f}%")
    
    if remaining_today <= 0:
        typer.echo(f"🛑 Daily limit exceeded! Wait until tomorrow.")
    elif remaining_today < 100:
        typer.echo(f"⚠️  Running low on requests - {remaining_today} left")
    else:
        typer.echo(f"✨ Good to go - {remaining_today} requests available")
    
    # Show when limit resets (next UTC midnight)
    now = datetime.now(timezone.utc)
    next_reset = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    reset_in = next_reset - now
    hours, remainder = divmod(reset_in.seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    typer.echo(f"⏰ Limit resets in: {hours}h {minutes}m")


@app.command()
def check_limits(
    isbn_count: int = typer.Argument(..., help="Number of ISBNs you plan to process"),
    delay: float = typer.Option(1.0, help="Planned delay between requests in seconds"),
):
    """Check if your planned batch size complies with API rate limits."""
    
    # Check TPS compliance
    if delay < 1.0:
        typer.echo("❌ TPS Compliance: FAIL", err=True)
        typer.echo(f"   Delay of {delay}s may exceed 1 TPS limit", err=True)
    else:
        typer.echo("✅ TPS Compliance: PASS")
        actual_tps = 1.0 / delay
        typer.echo(f"   Effective rate: {actual_tps:.2f} TPS (limit: 1.0 TPS)")
    
    # Check TPD compliance
    daily_limit = 8640  # Initial limit for new accounts
    if isbn_count > daily_limit:
        typer.echo("❌ TPD Compliance: FAIL", err=True)
        typer.echo(f"   {isbn_count} requests exceed daily limit of {daily_limit}")
        days_needed = (isbn_count + daily_limit - 1) // daily_limit
        typer.echo(f"   Consider splitting into {days_needed} days")
    else:
        typer.echo("✅ TPD Compliance: PASS")
        typer.echo(f"   {isbn_count} requests within daily limit of {daily_limit}")
    
    # Estimate time
    total_time_seconds = isbn_count * delay
    hours = total_time_seconds // 3600
    minutes = (total_time_seconds % 3600) // 60
    typer.echo(f"\n⏱️  Estimated time: {int(hours)}h {int(minutes)}m")
    
    typer.echo(f"\n📖 API Documentation: https://webservices.amazon.com/paapi5/documentation/troubleshooting/api-rates.html")


@app.command()
def test(
    isbn: str = typer.Argument("0770436404", help="Single ISBN to test"),
    debug_rate_limits: bool = typer.Option(False, "--debug-rate-limits", help="Drop into debugger on rate limit errors")
):
    """Test the API with a single ISBN."""
    
    try:
        # Load configuration
        config = load_amazon_config()
        typer.echo(f"🔍 Testing with ISBN: {isbn}")
        
        # Search for the product
        item = search_isbn(isbn, config, debug_rate_limits)
        
        # Display results
        if '_error' in item:
            typer.echo(f"❌ Error: {item['_error']}", err=True)
            if '_api_errors' in item:
                for error in item['_api_errors']:
                    typer.echo(f"   API Error: {error.get('Code', 'Unknown')} - {error.get('Message', 'Unknown error')}", err=True)
        else:
            typer.echo("✅ Success!")
            if 'ItemInfo' in item and 'Title' in item['ItemInfo']:
                title = item['ItemInfo']['Title']['DisplayValue']
                typer.echo(f"📖 Title: {title}")
            if 'ASIN' in item:
                typer.echo(f"🔗 ASIN: {item['ASIN']}")
            
            # Show the full response for debugging
            typer.echo("\n📄 Full response:")
            typer.echo(json.dumps(item, indent=2))
        
    except ValueError as e:
        typer.echo(f"❌ Configuration error: {e}", err=True)
        raise typer.Exit(1)
        
    except Exception as e:
        typer.echo(f"❌ Unexpected error: {e}", err=True)
        raise typer.Exit(1)


if __name__ == "__main__":
    app()
