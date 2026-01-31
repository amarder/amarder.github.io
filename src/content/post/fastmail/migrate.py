import os
from typing import Annotated, Optional

import typer
from dotenv import load_dotenv
from imapclient import IMAPClient
from tqdm import tqdm

load_dotenv()

app = typer.Typer()

IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.fastmail.com")
IMAP_USER = os.getenv("IMAP_USER")
IMAP_PASSWORD = os.getenv("IMAP_PASSWORD")


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

    # Get list of .eml files
    eml_files = sorted(f for f in os.listdir(folder_path) if f.endswith(".eml"))

    if not eml_files:
        typer.echo("No .eml files found in the specified folder.")
        raise typer.Exit(1)

    with IMAPClient(IMAP_SERVER, ssl=True) as server:
        server.login(IMAP_USER, imap_password)

        # Create folder if needed
        if target_folder not in [f[2] for f in server.list_folders()]:
            server.create_folder(target_folder)

        server.select_folder(target_folder)

        for filename in tqdm(eml_files, desc="Uploading emails"):
            path = os.path.join(folder_path, filename)
            with open(path, "rb") as f:
                raw_msg = f.read()

            # Default flags; adjust if you parse JSON metadata
            flags = []

            server.append(
                target_folder,
                raw_msg,
                flags=flags,
            )


if __name__ == "__main__":
    app()
