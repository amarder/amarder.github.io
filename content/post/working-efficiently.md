---
layout: post
title: Working Efficiently
date: 2013-04-17
draft: true
---

I just read Bram Moolenaar's
[Seven habits of effective text editing][habits] I think his three
basic steps are great:

> 1. While you are editing, keep an eye out for actions you repeat
>    and/or spend quite a bit of time on.
> 2. Find out if there is an editor command that will do this action
>    quicker.  Read the documentation, ask a friend, or look at how
>    others do this.
> 3. Train using the command.  Do this until your fingers type it
>    without thinking.

I imagine there is a similarly awesome checklist on how to optimize
code.  This post is a collection of some of the commands I use to
speed up my workflow.

# Emacs

## Reload settings without restarting

After modifying emacs settings in ~/.emacs.d/ one can load these
changings without restarting emacs with

    M-x load-file ~/.emacs.d/init.el
    
This speeds up emacs customization dramatically.

# Org Mode

Pull up this week's agenda:

    C-c a a
    
Switch to only tasks scheduled for today:

    d
    
Clock in / clock out.

Finish.

-----

How do I change when something is scheduled?

    C-c C-s         org-schedule
    
How do I find tasks that haven't been scheduled?

    C-c a u

With an org file open use `M-x describe-bindings` to see shortcuts
available.  Here is a quick reference of bindings I think are
important.

    C-c $           org-archive-subtree
    C-c C-w         org-refile
    
"A: urgent and important; B: of moderate urgency or importance; or C:
pretty much optional...Use the , key to set your tasks’ priorities."

## Custom Views

    C-c a c
    M-x customize-option org-agenda-custom-commands

# Python

## Run a single test case

To speed up the edit-test-fix cycle, it is nice to
[run a single test with nose][nose]:

    nosetests tests:TestUser


# bash

## Search command history quickly

> Create ~/.inputrc and fill it with this:
> 
>     "\e[A": history-search-backward
>     "\e[B": history-search-forward
>     set show-all-if-ambiguous on
>     set completion-ignore-case on
> 
> This allows you to search through your history using the up and down
> arrows ... i.e. type "cd /" and press the up arrow and you'll search
> through everything in your history that starts with "cd /".

Copied from [Jude Robinson](https://coderwall.com/p/oqtj8w).

## Search and replace over multiple files

    find -name "AGG_STORE*.do" -print | xargs sed -i "s/use transactions_raw\([0-9]\).dta/insheet using transactions_raw\1.csv/g"
    find -name "AGG_STORE*.do" -print | xargs sed -i "s/using transactions_raw/using ..\/..\/csvs\/transactions_raw/g"
    find -name "AGG_STORE*.do" -print | xargs sed -i "/! gunzip transactions_raw[0-9].dta.gz;/d" AGG_STORE1.do | more

## Mount samba share

sudo mount -t smbfs //research/amarder /media/research -o username=amarder,uid=1000


# Git

I forked a Git repository, edits were made to the original repo, how
do I merge those edits into my fork? Check out
[stackoverflow][merge-fork].


[habits]: http://www.moolenaar.net/habits.html
[nose]: http://stackoverflow.com/questions/3704473/how-do-i-run-a-single-test-with-nose-in-pylons
[merge-fork]: http://stackoverflow.com/questions/1123344/merging-between-forks-in-github
