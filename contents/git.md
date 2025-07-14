# Git

## Difference between `^` and `~`

`commit^n` choose the nth parent of the commit. `HEAD^` is equivalent to `HEAD^1`, `HEAD~`, `HEAD~1`.
```plaintext
G   H   I   J
 \ /     \ /
  D   E   F
   \  |  / \
    \ | /   |
     \|/    |
      B     C
       \   /
        \ /
         A

A =      = A^0
B = A^   = A^1     = A~1
C = A^2
D = A^^  = A^1^1   = A~2
E = B^2  = A^^2
F = B^3  = A^^3
G = A^^^ = A^1^1^1 = A~3
H = D^2  = B^^2    = A^^^2  = A~2^2
I = F^   = B^3^    = A^^3^
J = F^2  = B^3^2   = A^^3^2
```
## Clone

Clone a repository with its submodules:
```shell-session
$ git clone --recurse-submodules git@domain.tld:repo.git`
```

## Add & Move & Remove

Add file in a interactive patch way
```shell-session
$ git add -p/--patch <file>
```

- Move (Rename) file and stage: `git mv <filename1> <filename2>`;
- Remove file: `git rm <file>`;
- Remove file in index only: `git rm --cached <file>`.

## Commit

- Automatically stage changes, add sign-off, GPG-sign the commit: `git commit -asS`
- Fast modify last commit: `git commit --amend`

## Log

- Show log in a friendly format:
  ```shell-session
  $ git -P log --pretty='format:%C(auto)%G?%d %h %an %ar %s' --graph --all`
  ```
- Show commits with diff patch (`-p`, `-u`, `--patch`; `--cc` dense):
  ```shell-session
  $ git log -cc # Or
  $ git log --cc -1 # Shows for HEAD only
  ```
- Show commits for a user (`--author=`/`--committer=`):
  ```shell-session
  $ git log --author=<pattern>
  ```
- Grep in commit logs:
  ```shell-session
  $ git log --grep=<pattern>
  ```

- `--author=<pattern>`, `--committer=<pattern>`
- `-p`, `-u`, `--patch` Generate patch
- `--cc` Produce dense combined diff output for merge commits. Shortcut for `--diff-merges=dense-combined -p`.

## Diff

- Show a summary: `git -P diff --stat`
- Show diff of the last commit:
  ```shell-session
  $ git -P diff HEAD HEAD~1
  ```

## Blame

Show modification information on each line with last commit hash and author:
```shell-session
$ git blame --color-by-age --color-lines <file>
```

## Stash

`git stash`, `git stash pop`

## Branch & Remove

- Create a branch and set its upstream:
  ```shell-session
  $ git branch <old-branch> <new-branch>
  ```
  `-t`, `--track` Set "upstream" tracking for the new branch.
- Delete a branch:
  ```shell-session
  $ git branch -d/--delete <branch>
  ```
- Delete a remote branch:
  ```shell-session
  $ git push <remote> -d/--delete <branch> # Or
  $ git push <remote> :<branch>
  ```
- Rename a branch:
  ```shell-session
  $ git branch -m/--move <old-branch> <new-branch>
  ```
- To rename a remote branch, first delete the remote branch, then push a branch with new name:
  ```shell-session
  $ git push <remote> :<old-branch>
  $ git push <remote> <new-branch>
  ```
- Add remote and track:
  ```shell-session
  $ git remote add -t/--track <remote-branch> <remote-name> <url>
  ```

## Tag

- Tag current HEAD: `git tag <tag-name>`
- Push tags (under `refs/tags`): `git push --tags`

## Rebase

Modify last 10 commits: `git rebase -i HEAD~10`

Operations:
- `pick` Doesn't change this commit
- `drop` Drop this commit
- `edit` Edit this commit
- `squash` Merge this commit with one commit above

## Reset & Clean

Reset work tree and delete untracked files: `git reset --hard HEAD && git clean -fdx`

Reset options explanation:
- `--soft` Only change pointer HEAD to `<commit>`;
- `--mixed` Reset index only;
- `--hard` Reset both index and working tree;
- `--keep` Reset working tree only (If a file differs between `<commit>` and `HEAD`, and also has modified copy in index, this reset will be aborted)

Clean options explanation:
- `-f`, `--force` Allow `git-clean` to delete files or directories.
- `-d` Normally, when no `<path>` is set, `git clean` will not recurse into untracked directories to removing too much. Specify `-d` to have it recurse into such directories as well.
- `-x` Remove ignored files and directories mentioned in `.gitignore`.

## Restore

Restore a file from specify commit: `git restore -s <commit> <file>`

Options explanation:
`-s <tree>`, `--source=<tree>` Restore the working tree files with the content from the given tree.

## Rvert

Create a revert commit (Useful when in a team): `git revert <commit>`
                                                         k
## Submodule

- Show submodule status: `git submodule status`
- Add a submodule:
  ```shell-session
  $ git submodule add -b <remote-branch> [--name <name>] <url>
  ```
- Initialize and pin the submodule to a specific commit of super project:
  ```shell-session
  $ git submodule update --init # or
  $ git submodule init && git submodule update
  ```
- Update submodule to its remote-tracking branch:
  ```shell-session
  $ git submodule update --remote <submodule-name>
  ```
- Specify how differences the submodule are shown when using `git diff`:
  ```shell-session
  $ git diff --submodule=[diff|log|short]
  ```
- Only Push when submodules' commits are available on remote-tracking branch:
  ```shell-session
  $ git push --recurse-submodules=check
  ```
- Also Push submodules' commits:
  ```shell-session
  $ git push --recurse-submodules=on-demand`
  ```
- Run command on each submodule:
  ```shell-session
  $ git submodule foreach <command>
  ```

### Better Submodule for Git

Use [git-subrepo](https://github.com/ingydotnet/git-subrepo), then simply run `git subrepo` as prefix each time.

`git-subrepo` could convert a subdirectory into a sub repo as well
```shell-session
$ git subrepo init <subdir> [-r <remote>] [-b <branch>] [--method <merge|rebase>]
```


## Git Cherry-pick

`git-cherry-pick` are used to apply a commit in another branch into current branch.

Assume that the branch `dev` has a commit `38361a68`:
```shell-session
$ git checkout master
$ git cherry-pick 38361a68
```

## Git Format-patch

1. Create patch files between two commit
   ```shell-session
   $ git format-patch <r1>..<r2>
   ```
2. Single commit patch
   ```shell-session
   $ git format-patch -1 <r1>
   ```
3. Create patch file since commit r1 (Not inclusive)
   ```shell-session
   $ git format-patch <r1>
   ```
4. Apply a series of patches
   ```shell-session
   $ git am *.patch
   ```

## Limit the Memory Usage of `git-gc`

```shell-session
$ git config --global pack.windowMemory "100m"
$ git config --global pack.packSizeLimit "100m"
$ git config --global pack.threads "1"
```

## Reference

- [What's the difference between HEAD^ and HEAD~ in Git?](https://stackoverflow.com/a/2222920)
