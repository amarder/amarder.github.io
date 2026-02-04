import os
from datetime import datetime
from email import message_from_bytes
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Annotated

import typer
from dotenv import load_dotenv
from imapclient import IMAPClient
from tqdm import tqdm

load_dotenv()

app = typer.Typer()

IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.fastmail.com")
IMAP_USER = os.getenv("IMAP_USER")
IMAP_PASSWORD = os.getenv("IMAP_PASSWORD")

# Progress tracking files
UPLOADED_FILE = Path("uploaded.txt")
FAILED_FILE = Path("failed.txt")


def load_uploaded() -> set[str]:
    """Load the set of already-uploaded filenames."""
    if UPLOADED_FILE.exists():
        return set(UPLOADED_FILE.read_text().splitlines())
    return set()


def append_to_file(filepath: Path, filename: str) -> None:
    """Append a filename to a tracking file."""
    with filepath.open("a") as f:
        f.write(filename + "\n")


def iter_eml_files(folder_path: str, uploaded: set[str]):
    """Yield .eml filenames that haven't been uploaded yet."""
    with os.scandir(folder_path) as entries:
        for entry in entries:
            if entry.is_file() and entry.name.endswith(".eml") and entry.name not in uploaded:
                yield entry.name


def parse_email_date(raw_msg: bytes) -> datetime | None:
    """Extract the Date header from an email and return as datetime."""
    msg = message_from_bytes(raw_msg)
    date_str = msg.get("Date")
    if date_str:
        try:
            return parsedate_to_datetime(date_str)
        except (ValueError, TypeError):
            return None
    return None


@app.command()
def upload_eml(
    folder_path: Annotated[str, typer.Argument(help="Path to folder containing .eml files")] = "./proton-export/Inbox",
    target_folder: Annotated[str, typer.Option(help="Target IMAP folder name")] = "proton-import",
):
    """Upload .eml files from a folder to Fastmail."""
    # Use password from argument, env var, or prompt
    imap_password = IMAP_PASSWORD
    if not imap_password:
        imap_password = typer.prompt("IMAP Password", hide_input=True)

    if not IMAP_USER:
        typer.echo("Error: IMAP_USER must be set in .env file")
        raise typer.Exit(1)

    # Load already-uploaded files to skip
    uploaded = load_uploaded()
    typer.echo(f"Loaded {len(uploaded)} already-uploaded emails, scanning for remaining...")

    with IMAPClient(IMAP_SERVER, ssl=True) as server:
        server.login(IMAP_USER, imap_password)

        # Create folder if needed
        if target_folder not in [f[2] for f in server.list_folders()]:
            server.create_folder(target_folder)

        server.select_folder(target_folder)

        success_count = 0
        fail_count = 0
        skip_count = len(uploaded)

        for filename in tqdm(iter_eml_files(folder_path, uploaded), desc="Uploading emails", unit="email"):
            path = os.path.join(folder_path, filename)
            try:
                with open(path, "rb") as f:
                    raw_msg = f.read()

                # Parse the Date header to set the correct internal date
                msg_time = parse_email_date(raw_msg)

                # Default flags; adjust if you parse JSON metadata
                flags = []

                server.append(
                    target_folder,
                    raw_msg,
                    flags=flags,
                    msg_time=msg_time,
                )
                append_to_file(UPLOADED_FILE, filename)
                success_count += 1
            except Exception as e:
                append_to_file(FAILED_FILE, f"{filename}\t{e}")
                fail_count += 1

        typer.echo(f"\nDone! {success_count} uploaded, {fail_count} failed, {skip_count} previously uploaded.")


if __name__ == "__main__":
    app()
