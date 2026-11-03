import sys
import os
from dulwich import porcelain

def push_repo(username, token_or_password, repo_name="sarvam-ideathon"):
    repo_path = os.path.dirname(os.path.abspath(__file__))
    remote_url = f"https://{username}:{token_or_password}@github.com/{username}/{repo_name}.git"
    
    print(f"Setting remote 'origin' to https://github.com/{username}/{repo_name}.git ...")
    try:
        porcelain.remote_add(repo_path, "origin", remote_url)
    except Exception:
        # If already added, proceed
        pass

    print("Pushing 'master' branch to GitHub...")
    try:
        porcelain.push(repo_path, remote_url, "refs/heads/master:refs/heads/main")
        print("[SUCCESS] Successfully pushed to main branch on GitHub!")
    except Exception as e:
        try:
            porcelain.push(repo_path, remote_url, "refs/heads/master:refs/heads/master")
            print("[SUCCESS] Successfully pushed to master branch on GitHub!")
        except Exception as e2:
            print(f"[ERROR] Push failed: {e2}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python push_to_github.py <github_username> <github_token> [repo_name]")
        sys.exit(1)
    user = sys.argv[1]
    tok = sys.argv[2]
    rname = sys.argv[3] if len(sys.argv) > 3 else "sarvam-ideathon"
    push_repo(user, tok, rname)
