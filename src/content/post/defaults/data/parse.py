"""
Parse app defaults websites using OpenAI to extract structured data.

Usage:
    python parse.py                  # Process all unprocessed sites
    python parse.py --limit 10       # Process only 10 sites
    python parse.py --reprocess      # Reprocess all sites (ignore cache)
"""

import json
import logging
import os
import time
import argparse
from pathlib import Path

import requests
from openai import OpenAI
from pydantic import BaseModel, Field
from bs4 import BeautifulSoup
from tqdm import tqdm

# Configure logging - warnings go to console
logging.basicConfig(
    level=logging.WARNING,
    format="%(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


class AppDefaults(BaseModel):
    """Structured output for app defaults extraction."""

    mail_client: list[str] = Field(default_factory=list, serialization_alias="Mail Client")
    mail_server: list[str] = Field(default_factory=list, serialization_alias="Mail Server")
    notes: list[str] = Field(default_factory=list, serialization_alias="Notes")
    to_do: list[str] = Field(default_factory=list, serialization_alias="To-Do")
    photo_shooting: list[str] = Field(
        default_factory=list, serialization_alias="Phone Photo Shooting"
    )
    photo_management: list[str] = Field(
        default_factory=list, serialization_alias="Photo Management"
    )
    calendar: list[str] = Field(default_factory=list, serialization_alias="Calendar")
    cloud_file_storage: list[str] = Field(
        default_factory=list, serialization_alias="Cloud File Storage"
    )
    rss: list[str] = Field(default_factory=list, serialization_alias="RSS")
    contacts: list[str] = Field(default_factory=list, serialization_alias="Contacts")
    browser: list[str] = Field(default_factory=list, serialization_alias="Browser")
    chat: list[str] = Field(default_factory=list, serialization_alias="Chat")
    bookmarks: list[str] = Field(default_factory=list, serialization_alias="Bookmarks")
    read_it_later: list[str] = Field(
        default_factory=list, serialization_alias="Read It Later"
    )
    word_processing: list[str] = Field(
        default_factory=list, serialization_alias="Word Processing"
    )
    spreadsheets: list[str] = Field(default_factory=list, serialization_alias="Spreadsheets")
    presentations: list[str] = Field(
        default_factory=list, serialization_alias="Presentations"
    )
    shopping_lists: list[str] = Field(
        default_factory=list, serialization_alias="Shopping Lists"
    )
    meal_planning: list[str] = Field(default_factory=list, serialization_alias="Meal Planning")
    budgeting: list[str] = Field(
        default_factory=list, serialization_alias="Budgeting and Personal Finance"
    )
    news: list[str] = Field(default_factory=list, serialization_alias="News")
    music: list[str] = Field(default_factory=list, serialization_alias="Music")
    podcasts: list[str] = Field(default_factory=list, serialization_alias="Podcasts")
    password_management: list[str] = Field(
        default_factory=list, serialization_alias="Password Management"
    )

# File paths
SCRIPT_DIR = Path(__file__).parent
SITES_FILE = SCRIPT_DIR / "sites.json"
RESULTS_FILE = SCRIPT_DIR / "results.json"


def load_sites() -> list[dict]:
    """Load the list of sites to process."""
    with open(SITES_FILE) as f:
        return json.load(f)


def load_results() -> dict:
    """Load existing results (for resuming)."""
    if RESULTS_FILE.exists():
        with open(RESULTS_FILE) as f:
            return json.load(f)
    return {}


def save_results(results: dict) -> None:
    """Save results to file."""
    with open(RESULTS_FILE, "w") as f:
        json.dump(results, f, indent=2)


def fetch_page_content(url: str, timeout: int = 30) -> str | None:
    """Fetch and extract HTML content from a URL, preserving semantic tags."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        # Remove non-content elements but keep semantic structure
        for element in soup(["script", "style", "nav", "header", "footer", "aside", "iframe", "noscript"]):
            element.decompose()

        # Try to find the main content area
        main_content = (
            soup.find("main")
            or soup.find("article")
            or soup.find(class_=lambda x: x and ("content" in x.lower() or "post" in x.lower()))
            or soup.find("body")
            or soup
        )

        # Get cleaned HTML (preserves tags like <del>, <s>, <strong>, <em>, <ul>, <li>, etc.)
        html = str(main_content)

        # Limit length to avoid token limits (roughly 20k chars for HTML)
        if len(html) > 20000:
            logger.warning(f"Content truncated for {url} (was {len(html)} chars)")
            html = html[:20000] + "\n<!-- truncated -->"

        return html
    except requests.exceptions.Timeout:
        logger.warning(f"Timeout fetching {url}")
        return None
    except requests.exceptions.HTTPError as e:
        logger.warning(f"HTTP {e.response.status_code} for {url}")
        return None
    except Exception as e:
        logger.warning(f"Error fetching {url}: {e}")
        return None


def parse_with_openai(client: OpenAI, content: str, name: str) -> dict | None:
    """Use OpenAI to extract app defaults from page content."""
    prompt = f"""Analyze this blog post about someone's default apps and extract what apps/services they currently use for each category.

The post is by: {name}

The content is HTML. Pay attention to semantic markup:
- Apps wrapped in <del>, <s>, or <strike> tags are NO LONGER USED - do not include these
- Apps marked as "former", "previous", "stopped using", "switched from", etc. should not be included
- Only include apps they currently use as their defaults

For each field, extract the app/service names as a list. If they use multiple apps for a category, include each as a separate item. If a category is not mentioned or they don't use anything for it, return an empty list.

HTML content:
{content}"""

    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that extracts structured data from blog posts about app defaults. You understand HTML and pay attention to semantic markup like <del> tags indicating discontinued usage.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            response_format=AppDefaults,
        )

        result = response.choices[0].message.parsed
        return result.model_dump(by_alias=True)
    except Exception as e:
        logger.warning(f"OpenAI error for {name}: {e}")
        return None


def process_site(client: OpenAI, site: dict) -> dict | None:
    """Process a single site and return extracted data."""
    url = site["url"]
    name = site["name"]

    # Fetch content
    content = fetch_page_content(url)
    if not content:
        return {"error": "Failed to fetch content", "url": url, "name": name}

    # Parse with OpenAI
    result = parse_with_openai(client, content, name)
    if not result:
        return {"error": "Failed to parse with OpenAI", "url": url, "name": name}

    # Add metadata
    result["_meta"] = {
        "url": url,
        "name": name,
        "date": site.get("date"),
        "processed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    return result


def main():
    parser = argparse.ArgumentParser(description="Parse app defaults websites")
    parser.add_argument("--limit", type=int, help="Limit number of sites to process")
    parser.add_argument(
        "--reprocess", action="store_true", help="Reprocess all sites"
    )
    args = parser.parse_args()

    # Check for API key
    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable not set")
        print("Export your API key: export OPENAI_API_KEY='your-key-here'")
        return

    client = OpenAI()

    # Load data
    sites = load_sites()
    results = {} if args.reprocess else load_results()

    print(f"Found {len(sites)} sites, {len(results)} already processed")

    # Filter to unprocessed sites
    if not args.reprocess:
        sites = [s for s in sites if s["url"] not in results]

    if args.limit:
        sites = sites[: args.limit]

    if not sites:
        print("No sites to process.")
        return

    # Track statistics
    success_count = 0
    error_count = 0

    # Process with progress bar
    for site in tqdm(sites, desc="Processing sites", unit="site"):
        result = process_site(client, site)
        if result:
            results[site["url"]] = result
            if "error" in result:
                error_count += 1
            else:
                success_count += 1
            # Save after each site (for resumability)
            save_results(results)

        # Small delay to be nice to servers and API
        time.sleep(0.5)

    print(f"\nDone! {success_count} succeeded, {error_count} failed")
    print(f"Total results: {len(results)}")
    print(f"Results saved to: {RESULTS_FILE}")


if __name__ == "__main__":
    main()
