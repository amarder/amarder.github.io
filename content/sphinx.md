---
title: Using Travis CI to Build Sphinx Docs
date: 2018-01-11
---

If you want a simple way to automate building your documentation, then this post is for you. We will be using [Sphinx](http://www.sphinx-doc.org/en/stable/), [Travis CI](https://travis-ci.org/), and [GitHub](https://github.com/).

1.  Create a public repository on GitHub. [#](https://help.github.com/articles/create-a-repo/)
2.  Get Sphinx working on your local copy of the repository. [#](http://www.sphinx-doc.org/en/stable/tutorial.html)
3.  Synchronize your GitHub repositories with Travis CI, and tell Travis CI to build your new repo. [#](https://docs.travis-ci.com/user/getting-started/)
4.  Create a personal access token on GitHub and copy it over to Travis. [#](https://docs.travis-ci.com/user/deployment/pages/#Setting-the-GitHub-token)
5.  Add the following code to your `.travis.yml` file in the root directory of your repository. [#](https://docs.travis-ci.com/user/deployment/pages/)

``` yml
language: python

install:
  - pip install -r requirements.txt

script:
  # Use Sphinx to make the html docs
  - make html
  # Tell GitHub not to use jekyll to compile the docs
  - touch _build/html/.nojekyll

# Tell Travis CI to copy the documentation to the gh-pages branch of
# your GitHub repository.
deploy:
  provider: pages
  skip_cleanup: true
  github_token: $GITHUB_TOKEN  # Set in travis-ci.org dashboard, marked secure
  keep-history: true
  on:
    branch: master
  local_dir: _build/html/
```
