#!/usr/bin/env python3
"""
Script to recursively download a Bluesky post and all its quotes using BFS.
Saves slimmed-down data in hierarchical format for D3 visualization.
Usage: python download.py
"""

import requests
import json
import sys
import time
import os
from urllib.parse import urlparse
from datetime import datetime
from getpass import getpass
from collections import deque

def create_session(username=None, password=None):
    """
    Create an authenticated session with Bluesky.
    """
    if not username:
        username = input("Enter your Bluesky username/handle: ")
    if not password:
        password = getpass("Enter your Bluesky password (or app password): ")
    
    try:
        response = requests.post(
            "https://bsky.social/xrpc/com.atproto.server.createSession",
            json={"identifier": username, "password": password}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating session: {e}")
        return None

def extract_info_from_url(url):
    """
    Extract handle and post ID from a Bluesky post URL.
    Example: https://bsky.app/profile/mithrilmist.bsky.social/post/3lt6hdhi7gk2k
    Returns: (handle, post_id)
    """
    parsed = urlparse(url)
    path_parts = parsed.path.strip('/').split('/')
    
    if len(path_parts) >= 4 and path_parts[0] == 'profile' and path_parts[2] == 'post':
        handle = path_parts[1]
        post_id = path_parts[3]
        return handle, post_id
    else:
        raise ValueError(f"Invalid Bluesky post URL format: {url}")

def resolve_handle_to_did(handle):
    """
    Resolve a Bluesky handle to its DID (Decentralized Identifier).
    """
    try:
        response = requests.get(
            "https://bsky.social/xrpc/com.atproto.identity.resolveHandle",
            params={"handle": handle}
        )
        response.raise_for_status()
        return response.json()["did"]
    except requests.exceptions.RequestException as e:
        print(f"Error resolving handle '{handle}': {e}")
        return None

def parse_at_uri(uri):
    """
    Parse an AT URI to extract DID and record key.
    Example: at://did:plc:abc123/app.bsky.feed.post/xyz789
    Returns: (did, rkey)
    """
    if not uri.startswith("at://"):
        return None, None
    
    parts = uri[5:].split('/')  # Remove 'at://' prefix
    if len(parts) >= 3:
        did = parts[0]
        rkey = parts[2]
        return did, rkey
    return None, None

def get_post_record_from_uri(uri):
    """
    Fetch a post record from its AT URI.
    """
    did, rkey = parse_at_uri(uri)
    if not did or not rkey:
        return None
    
    try:
        response = requests.get(
            "https://bsky.social/xrpc/com.atproto.repo.getRecord",
            params={
                "repo": did,
                "collection": "app.bsky.feed.post",
                "rkey": rkey
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching post record for {uri}: {e}")
        return None

def get_post_quotes(post_uri, session=None):
    """
    Fetch all quotes of a post using the app.bsky.feed.getQuotes endpoint.
    Returns a list of all quotes with pagination handling.
    """
    all_quotes = []
    cursor = None
    
    headers = {}
    if session and session.get('accessJwt'):
        headers['Authorization'] = f"Bearer {session['accessJwt']}"
    
    while True:
        try:
            params = {"uri": post_uri, "limit": 100}
            if cursor:
                params["cursor"] = cursor
            
            response = requests.get(
                "https://bsky.social/xrpc/app.bsky.feed.getQuotes",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            posts = data.get("posts", [])
            all_quotes.extend(posts)
            
            # Check if there are more posts to fetch
            cursor = data.get("cursor")
            if not cursor or not posts:
                break
                
            # Add a small delay to be respectful to the API
            time.sleep(0.1)
            
        except requests.exceptions.RequestException as e:
            if hasattr(response, 'status_code') and response.status_code == 401:
                print(f"Authentication required for fetching quotes of {post_uri}")
            else:
                print(f"Error fetching quotes for {post_uri}: {e}")
            break
    
    return all_quotes

def extract_slim_data(post_data, is_root=False):
    """
    Extract only essential data from a post for the visualization.
    Returns a slimmed-down version with only the required fields.
    """
    slim_data = {
        "author_handle": None,
        "author_display_name": None,
        "post_url": None,
        "media_urls": []
    }
    
    # Handle different API response formats
    if is_root:
        # Root post from repo API
        if 'value' in post_data:
            # Extract author info from URI
            uri = post_data.get('uri', '')
            if uri:
                did, rkey = parse_at_uri(uri)
                if did and rkey:
                    slim_data["post_url"] = f"at://{did}/app.bsky.feed.post/{rkey}"
            
            # Extract media from embed
            value = post_data.get('value', {})
            embed = value.get('embed', {})
            slim_data["media_urls"] = extract_media_urls(embed, did)
            
    else:
        # Quote posts from feed API
        author = post_data.get('author', {})
        slim_data["author_handle"] = author.get('handle')
        slim_data["author_display_name"] = author.get('displayName')
        
        # Extract post URL
        uri = post_data.get('uri', '')
        if uri:
            did, rkey = parse_at_uri(uri)
            if did and rkey and slim_data["author_handle"]:
                slim_data["post_url"] = f"https://bsky.app/profile/{slim_data['author_handle']}/post/{rkey}"
        
        # Extract media from record
        record = post_data.get('record', {})
        embed = record.get('embed', {})
        slim_data["media_urls"] = extract_media_urls(embed, author.get('did'))
    
    return slim_data

def extract_media_urls(embed, author_did):
    """
    Extract media URLs from embed data.
    Returns a list of media URLs that can be embedded.
    """
    media_urls = []
    
    if not embed:
        return media_urls
    
    embed_type = embed.get('$type', '')
    
    if embed_type == 'app.bsky.embed.images':
        # Handle images
        images = embed.get('images', [])
        for image in images:
            if image.get('image') and image['image'].get('ref'):
                ref = image['image']['ref'].get('$link')
                if ref and author_did:
                    media_url = f"https://bsky.social/xrpc/com.atproto.sync.getBlob?did={author_did}&cid={ref}"
                    media_urls.append({
                        "url": media_url,
                        "alt": image.get('alt', ''),
                        "type": "image"
                    })
    
    elif embed_type == 'app.bsky.embed.video':
        # Handle videos
        video = embed.get('video', {})
        if video.get('ref'):
            ref = video['ref'].get('$link')
            if ref and author_did:
                media_url = f"https://bsky.social/xrpc/com.atproto.sync.getBlob?did={author_did}&cid={ref}"
                media_urls.append({
                    "url": media_url,
                    "alt": video.get('alt', ''),
                    "type": "video"
                })
    
    elif embed_type == 'app.bsky.embed.external':
        # Handle external embeds (GIFs, etc.)
        external = embed.get('external', {})
        if external.get('uri'):
            media_urls.append({
                "url": external['uri'],
                "alt": external.get('description', ''),
                "type": "external"
            })
    
    elif embed_type == 'app.bsky.embed.recordWithMedia':
        # Handle record with media (quote posts with media)
        media_embed = embed.get('media', {})
        if media_embed:
            # Recursively extract media from the nested embed
            nested_media = extract_media_urls(media_embed, author_did)
            media_urls.extend(nested_media)
    
    else:
        # Unknown embed type - print for debugging
        print(f"Unknown embed type: {embed_type}")
        print(f"Embed data: {json.dumps(embed, indent=2)}")
    
    return media_urls

def download_bfs(post_uri, session, max_depth=3, source_url=None):
    """
    Download posts and quotes using breadth-first search.
    Returns a hierarchical structure preserving all raw API data.
    """
    visited = set()
    stats = {"total_posts": 0, "total_quotes": 0, "max_depth_reached": 0}
    
    # Initialize the queue with the root post
    # Queue items: (uri, depth, parent_node)
    queue = deque([(post_uri, 0, None)])
    
    # Get root post data first
    root_post_data = get_post_record_from_uri(post_uri)
    if not root_post_data:
        print(f"Failed to fetch root post data for {post_uri}")
        return None, stats
    
    # Create root node with full API data
    root_node = {
        "post": root_post_data,
        "source_url": source_url,
        "depth": 0,
        "children": []
    }
    
    # Map to keep track of nodes by URI for building hierarchy
    uri_to_node = {post_uri: root_node}
    
    print(f"Starting BFS from: {post_uri}")
    print(f"Maximum depth: {max_depth}")
    
    while queue:
        current_uri, depth, parent_node = queue.popleft()
        
        # Skip if already visited or max depth exceeded
        if current_uri in visited or depth > max_depth:
            continue
        
        visited.add(current_uri)
        stats["max_depth_reached"] = max(stats["max_depth_reached"], depth)
        stats["total_posts"] += 1
        
        print(f"{'  ' * depth}Processing depth {depth}: {current_uri[:50]}...")
        
        # Get quotes for current post
        quotes = get_post_quotes(current_uri, session)
        stats["total_quotes"] += len(quotes)
        
        print(f"{'  ' * depth}Found {len(quotes)} quotes at depth {depth}")
        
        # Get the current node (root node or create new one)
        if current_uri == post_uri:
            current_node = root_node
        else:
            # This should have been created when processing its parent
            current_node = uri_to_node.get(current_uri)
            if not current_node:
                print(f"Warning: Node not found for {current_uri}")
                continue
        
        # Process each quote
        for quote in quotes:
            quote_uri = quote.get('uri')
            if quote_uri and quote_uri not in visited:
                # Create quote node with full API data
                quote_node = {
                    "post": quote,  # This contains the full quote data from the feed API
                    "depth": depth + 1,
                    "children": []
                }
                
                # Add to parent's children
                current_node["children"].append(quote_node)
                
                # Map URI to node for future reference
                uri_to_node[quote_uri] = quote_node
                
                # Add to queue for next level processing
                if depth < max_depth:
                    queue.append((quote_uri, depth + 1, quote_node))
    
    return root_node, stats

def main():
    # The specific post URL from the request
    post_url = "https://bsky.app/profile/mithrilmist.bsky.social/post/3lt6hdhi7gk2k"
    
    print(f"Downloading Bluesky post and quotes using BFS: {post_url}")
    print("Output format: Raw API data in hierarchical structure")
    print("=" * 60)
    
    # Check for environment variables first
    username = os.getenv('BLUESKY_USERNAME')
    password = os.getenv('BLUESKY_PASSWORD')
    
    session = None
    if username and password:
        print("Using credentials from environment variables...")
        session = create_session(username, password)
    else:
        print("No credentials found in environment variables.")
        auth_choice = input("Do you want to authenticate to fetch quotes? (y/n): ").lower()
        if auth_choice == 'y':
            session = create_session()
    
    if session:
        print(f"✓ Authenticated as: {session.get('handle', 'Unknown')}")
    else:
        print("⚠ Running without authentication - quotes may not be available")
    
    # Get max depth from user
    max_depth_input = input("Enter maximum depth for BFS download (default: 3): ").strip()
    try:
        max_depth = int(max_depth_input) if max_depth_input else 3
    except ValueError:
        max_depth = 3
    
    print(f"Maximum depth: {max_depth}")
    
    try:
        # Extract handle and post ID from URL
        handle, post_id = extract_info_from_url(post_url)
        print(f"Handle: {handle}")
        print(f"Post ID: {post_id}")
        
        # Resolve handle to DID
        print(f"\nResolving handle '{handle}' to DID...")
        did = resolve_handle_to_did(handle)
        if not did:
            print("Failed to resolve handle to DID")
            return
        
        print(f"DID: {did}")
        
        # Construct the post URI
        post_uri = f"at://{did}/app.bsky.feed.post/{post_id}"
        
        # Prepare output file
        output_file = f"bluesky_raw_{post_id}.json"
        
        print(f"\n" + "=" * 60)
        print("STARTING BFS DOWNLOAD:")
        print("=" * 60)
        
        # Start BFS download
        tree_data, stats = download_bfs(post_uri, session, max_depth=max_depth, source_url=post_url)
        
        if tree_data:
            # Write raw API data as JSON
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(tree_data, f, indent=2, ensure_ascii=False)
            
            print(f"\n" + "=" * 60)
            print("DOWNLOAD COMPLETE:")
            print("=" * 60)
            print(f"Total posts processed: {stats['total_posts']}")
            print(f"Total quotes found: {stats['total_quotes']}")
            print(f"Maximum depth reached: {stats['max_depth_reached']}")
            print(f"Output file: {output_file}")
            print(f"File format: Raw API data in hierarchical JSON")
            
            # Also create a copy as flare-2.json for the visualization
            flare_output = "flare-2.json"
            with open(flare_output, 'w', encoding='utf-8') as f:
                json.dump(tree_data, f, indent=2, ensure_ascii=False)
            print(f"Copy saved as: {flare_output}")
            
            if not session:
                print("\n💡 Tip: Authenticate to download quotes recursively")
        else:
            print("Failed to download data")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
