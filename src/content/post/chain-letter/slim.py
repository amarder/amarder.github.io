#!/usr/bin/env python3
"""
Slimmed-down script to download Bluesky posts and quotes.
Only saves essential data: media URLs, author info, and post links.
Usage: python slim.py
"""

import requests
import json
import sys
import time
import os
from urllib.parse import urlparse
from getpass import getpass
from collections import deque

def create_session(username=None, password=None):
    """Create an authenticated session with Bluesky."""
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
    """Extract handle and post ID from a Bluesky post URL."""
    parsed = urlparse(url)
    path_parts = parsed.path.strip('/').split('/')
    
    if len(path_parts) >= 4 and path_parts[0] == 'profile' and path_parts[2] == 'post':
        handle = path_parts[1]
        post_id = path_parts[3]
        return handle, post_id
    else:
        raise ValueError(f"Invalid Bluesky post URL format: {url}")

def resolve_handle_to_did(handle):
    """Resolve a Bluesky handle to its DID."""
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
    """Parse an AT URI to extract DID and record key."""
    if not uri.startswith("at://"):
        return None, None
    
    parts = uri[5:].split('/')
    if len(parts) >= 3:
        did = parts[0]
        rkey = parts[2]
        return did, rkey
    return None, None

def get_post_record_from_uri(uri):
    """Fetch a post record from its AT URI."""
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
    """Fetch all quotes of a post using the app.bsky.feed.getQuotes endpoint."""
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
            
            cursor = data.get("cursor")
            if not cursor or not posts:
                break
                
            time.sleep(0.1)
            
        except requests.exceptions.RequestException as e:
            if hasattr(response, 'status_code') and response.status_code == 401:
                print(f"Authentication required for fetching quotes of {post_uri}")
            else:
                print(f"Error fetching quotes for {post_uri}: {e}")
            break
    
    return all_quotes

def extract_media_urls(embed, author_did):
    """Extract media URLs from embed data."""
    media_urls = []
    
    if not embed:
        return media_urls
    
    embed_type = embed.get('$type', '')
    
    if embed_type == 'app.bsky.embed.images':
        images = embed.get('images', [])
        for image in images:
            if image.get('image') and image['image'].get('ref'):
                ref = image['image']['ref'].get('$link')
                if ref and author_did:
                    media_url = f"https://bsky.social/xrpc/com.atproto.sync.getBlob?did={author_did}&cid={ref}"
                    media_urls.append({
                        "url": media_url,
                        "type": "image"
                    })
    
    elif embed_type == 'app.bsky.embed.video':
        video = embed.get('video', {})
        if video.get('ref'):
            ref = video['ref'].get('$link')
            if ref and author_did:
                media_url = f"https://bsky.social/xrpc/com.atproto.sync.getBlob?did={author_did}&cid={ref}"
                media_urls.append({
                    "url": media_url,
                    "type": "video"
                })
    
    elif embed_type == 'app.bsky.embed.external':
        external = embed.get('external', {})
        if external.get('uri'):
            media_urls.append({
                "url": external['uri'],
                "type": "external"
            })
    
    elif embed_type == 'app.bsky.embed.recordWithMedia':
        media_embed = embed.get('media', {})
        if media_embed:
            nested_media = extract_media_urls(media_embed, author_did)
            media_urls.extend(nested_media)
    
    elif embed_type == 'app.bsky.embed.record':
        # This is a quote post embed, not media - skip it
        pass
    
    else:
        # Unknown embed type - print for debugging
        print(f"Unknown embed type: {embed_type}")
        print(f"Embed data: {json.dumps(embed, indent=2)}")
    
    return media_urls

def extract_slim_data(post_data, is_root=False, source_url=None):
    """Extract only essential data from a post."""
    slim_data = {
        "display_name": None,
        "post_url": None,
        "media_urls": []
    }
    
    if is_root:
        # Root post from repo API
        if 'value' in post_data:
            uri = post_data.get('uri', '')
            if uri:
                did, rkey = parse_at_uri(uri)
                if did and rkey:
                    # For root post, we need to extract handle from source_url
                    if source_url:
                        try:
                            handle, _ = extract_info_from_url(source_url)
                            slim_data["post_url"] = f"https://bsky.app/profile/{handle}/post/{rkey}"
                            
                            # Hardcode the display name for the root post
                            slim_data["display_name"] = "Mithrilmist"
                        except:
                            slim_data["post_url"] = f"at://{did}/app.bsky.feed.post/{rkey}"
                    else:
                        slim_data["post_url"] = f"at://{did}/app.bsky.feed.post/{rkey}"
            
            value = post_data.get('value', {})
            embed = value.get('embed', {})
            slim_data["media_urls"] = extract_media_urls(embed, did)
            
    else:
        # Quote posts from feed API
        author = post_data.get('author', {})
        slim_data["display_name"] = author.get('displayName')
        
        uri = post_data.get('uri', '')
        if uri:
            did, rkey = parse_at_uri(uri)
            if did and rkey and author.get('handle'):
                slim_data["post_url"] = f"https://bsky.app/profile/{author['handle']}/post/{rkey}"
        
        record = post_data.get('record', {})
        embed = record.get('embed', {})
        slim_data["media_urls"] = extract_media_urls(embed, author.get('did'))
    
    return slim_data

def download_bfs_slim(post_uri, session, max_depth=3, source_url=None):
    """Download posts and quotes using BFS, saving only slim data."""
    visited = set()
    stats = {"total_posts": 0, "total_quotes": 0, "max_depth_reached": 0}
    
    queue = deque([(post_uri, 0, None)])
    
    # Get root post data
    root_post_data = get_post_record_from_uri(post_uri)
    if not root_post_data:
        print(f"Failed to fetch root post data for {post_uri}")
        return None, stats
    
    # Create slim root node
    root_node = {
        **extract_slim_data(root_post_data, is_root=True, source_url=source_url),
        "children": []
    }
    
    uri_to_node = {post_uri: root_node}
    
    print(f"Starting BFS from: {post_uri}")
    print(f"Maximum depth: {max_depth}")
    
    while queue:
        current_uri, depth, parent_node = queue.popleft()
        
        if current_uri in visited or depth > max_depth:
            continue
        
        visited.add(current_uri)
        stats["max_depth_reached"] = max(stats["max_depth_reached"], depth)
        stats["total_posts"] += 1
        
        print(f"{'  ' * depth}Processing depth {depth}: {current_uri[:50]}...")
        
        quotes = get_post_quotes(current_uri, session)
        stats["total_quotes"] += len(quotes)
        
        print(f"{'  ' * depth}Found {len(quotes)} quotes at depth {depth}")
        
        if current_uri == post_uri:
            current_node = root_node
        else:
            current_node = uri_to_node.get(current_uri)
            if not current_node:
                print(f"Warning: Node not found for {current_uri}")
                continue
        
        for quote in quotes:
            quote_uri = quote.get('uri')
            if quote_uri and quote_uri not in visited:
                # Create slim quote node
                quote_node = {
                    **extract_slim_data(quote, is_root=False),
                    "children": []
                }
                
                current_node["children"].append(quote_node)
                uri_to_node[quote_uri] = quote_node
                
                if depth < max_depth:
                    queue.append((quote_uri, depth + 1, quote_node))
    
    return root_node, stats

def main():
    post_url = "https://bsky.app/profile/mithrilmist.bsky.social/post/3lt6hdhi7gk2k"
    
    print(f"Downloading Bluesky post and quotes (SLIM VERSION): {post_url}")
    print("Output format: Essential data only (media, author, post links)")
    print("=" * 60)
    
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
    
    max_depth_input = input("Enter maximum depth for BFS download (default: 3): ").strip()
    try:
        max_depth = int(max_depth_input) if max_depth_input else 3
    except ValueError:
        max_depth = 3
    
    print(f"Maximum depth: {max_depth}")
    
    try:
        handle, post_id = extract_info_from_url(post_url)
        print(f"Handle: {handle}")
        print(f"Post ID: {post_id}")
        
        print(f"\nResolving handle '{handle}' to DID...")
        did = resolve_handle_to_did(handle)
        if not did:
            print("Failed to resolve handle to DID")
            return
        
        print(f"DID: {did}")
        
        post_uri = f"at://{did}/app.bsky.feed.post/{post_id}"
        output_file = f"bluesky_slim_{post_id}.json"
        
        print(f"\n" + "=" * 60)
        print("STARTING BFS DOWNLOAD (SLIM):")
        print("=" * 60)
        
        tree_data, stats = download_bfs_slim(post_uri, session, max_depth=max_depth, source_url=post_url)
        
        if tree_data:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(tree_data, f, indent=2, ensure_ascii=False)
            
            print(f"\n" + "=" * 60)
            print("DOWNLOAD COMPLETE (SLIM):")
            print("=" * 60)
            print(f"Total posts processed: {stats['total_posts']}")
            print(f"Total quotes found: {stats['total_quotes']}")
            print(f"Maximum depth reached: {stats['max_depth_reached']}")
            print(f"Output file: {output_file}")
            print(f"File format: Slimmed-down JSON with essential data only")
            
            # Also create a copy for the visualization
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