"""
Parse app defaults websites using OpenAI to extract structured data.

Usage:
    python parse.py                  # Process all unprocessed sites
    python parse.py --limit 10       # Process only 10 sites
    python parse.py --reprocess      # Reprocess all sites (ignore cache)
"""

import json
import os
import time
import argparse
from pathlib import Path

import requests
from openai import OpenAI
from pydantic import BaseModel, Field
from bs4 import BeautifulSoup


class AppDefaults(BaseModel):
    """Structured output for app defaults extraction."""

    mail_client: str | None = Field(default=None, serialization_alias="Mail Client")
    mail_server: str | None = Field(default=None, serialization_alias="Mail Server")
    notes: str | None = Field(default=None, serialization_alias="Notes")
    to_do: str | None = Field(default=None, serialization_alias="To-Do")
    photo_shooting: str | None = Field(
        default=None, serialization_alias="Phone Photo Shooting"
    )
    photo_management: str | None = Field(
        default=None, serialization_alias="Photo Management"
    )
    calendar: str | None = Field(default=None, serialization_alias="Calendar")
    cloud_file_storage: str | None = Field(
        default=None, serialization_alias="Cloud File Storage"
    )
    rss: str | None = Field(default=None, serialization_alias="RSS")
    contacts: str | None = Field(default=None, serialization_alias="Contacts")
    browser: str | None = Field(default=None, serialization_alias="Browser")
    chat: str | None = Field(default=None, serialization_alias="Chat")
    bookmarks: str | None = Field(default=None, serialization_alias="Bookmarks")
    read_it_later: str | None = Field(
        default=None, serialization_alias="Read It Later"
    )
    word_processing: str | None = Field(
        default=None, serialization_alias="Word Processing"
    )
    spreadsheets: str | None = Field(default=None, serialization_alias="Spreadsheets")
    presentations: str | None = Field(
        default=None, serialization_alias="Presentations"
    )
    shopping_lists: str | None = Field(
        default=None, serialization_alias="Shopping Lists"
    )
    meal_planning: str | None = Field(default=None, serialization_alias="Meal Planning")
    budgeting: str | None = Field(
        default=None, serialization_alias="Budgeting and Personal Finance"
    )
    news: str | None = Field(default=None, serialization_alias="News")
    music: str | None = Field(default=None, serialization_alias="Music")
    podcasts: str | None = Field(default=None, serialization_alias="Podcasts")
    password_management: str | None = Field(
        default=None, serialization_alias="Password Management"
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
    """Fetch and extract text content from a URL."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        # Remove script and style elements
        for element in soup(["script", "style", "nav", "header", "footer"]):
            element.decompose()

        # Get text content
        text = soup.get_text(separator="\n", strip=True)

        # Limit text length to avoid token limits (roughly 15k chars ≈ 4k tokens)
        if len(text) > 15000:
            text = text[:15000] + "\n... [truncated]"

        return text
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None


def parse_with_openai(client: OpenAI, content: str, name: str) -> dict | None:
    """Use OpenAI to extract app defaults from page content."""
    prompt = f"""Analyze this blog post about someone's default apps and extract what apps/services they use for each category.

The post is by: {name}

For each field, extract the app/service name they mention. If they list multiple apps for a category, include all of them separated by commas. If a category is not mentioned or they explicitly say they don't use anything for it, leave it as null.

Blog post content:
{content}"""

    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that extracts structured data from blog posts about app defaults.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            response_format=AppDefaults,
        )

        result = response.choices[0].message.parsed
        return result.model_dump(by_alias=True)
    except Exception as e:
        print(f"  OpenAI error: {e}")
        return None


def process_site(client: OpenAI, site: dict) -> dict | None:
    """Process a single site and return extracted data."""
    url = site["url"]
    name = site["name"]

    print(f"Processing: {name}")
    print(f"  URL: {url}")

    # Fetch content
    content = fetch_page_content(url)
    if not content:
        return {"error": "Failed to fetch content", "url": url, "name": name}

    print(f"  Fetched {len(content)} characters")

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

    print(f"  Successfully extracted data")
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

    print(f"Found {len(sites)} sites")
    print(f"Already processed: {len(results)}")

    # Filter to unprocessed sites
    if not args.reprocess:
        sites = [s for s in sites if s["url"] not in results]

    if args.limit:
        sites = sites[: args.limit]

    print(f"Processing {len(sites)} sites")
    print("-" * 50)

    for i, site in enumerate(sites):
        result = process_site(client, site)
        if result:
            results[site["url"]] = result
            # Save after each site (for resumability)
            save_results(results)

        # Small delay to be nice to servers and API
        if i < len(sites) - 1:
            time.sleep(1)

    print("-" * 50)
    print(f"Done! Processed {len(sites)} sites")
    print(f"Total results: {len(results)}")
    print(f"Results saved to: {RESULTS_FILE}")


if __name__ == "__main__":
    main()
